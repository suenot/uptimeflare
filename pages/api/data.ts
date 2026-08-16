import { maintenances } from '@/config/page'
import { monitors as monitorConfigs } from '@/config/monitors'
import { NextRequest } from 'next/server'
import { CompactedMonitorStateWrapper, getFromStore } from '@/worker/src/store'

export const runtime = 'edge'

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async function handler(req: NextRequest): Promise<Response> {
  const compactedState = new CompactedMonitorStateWrapper(
    await getFromStore(process.env as any, 'state')
  )

  if (compactedState.data.lastUpdate === 0) {
    return new Response(JSON.stringify({ error: 'No data available' }), {
      status: 500,
      headers,
    })
  }

  const monitorStates: Record<
    string,
    {
      up: boolean
      latency: number | null
      location: string | null
      message: string
    }
  > = {}

  for (const monitor of monitorConfigs) {
    const incidentCount = compactedState.incidentLen(monitor.id)
    const lastIncident = incidentCount
      ? compactedState.getIncident(monitor.id, incidentCount - 1)
      : undefined

    const isUp = lastIncident?.end !== null
    const latency = compactedState.data.latency[monitor.id]
      ? compactedState.getLastLatency(monitor.id)
      : undefined
    monitorStates[monitor.id] = {
      up: isUp,
      latency: latency?.ping ?? null,
      location: latency?.loc ?? null,
      message: isUp ? 'OK' : lastIncident?.error[lastIncident.error.length - 1],
    }
  }

  let ret = {
    up: compactedState.data.overallUp,
    down: compactedState.data.overallDown,
    updatedAt: compactedState.data.lastUpdate,
    monitors: monitorStates,
    maintenances,
  }

  return new Response(JSON.stringify(ret), {
    headers,
  })
}
