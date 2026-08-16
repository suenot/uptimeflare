import Head from 'next/head'
import dynamic from 'next/dynamic'

import { MonitorTarget } from '@/types/config'
import { maintenances, pageConfig } from '@/uptime.config'
import { Center, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { CompactedMonitorStateWrapper, getFromStore } from '@/worker/src/store'
import MarketMakerStatus from '@/components/MarketMakerStatus'

export const runtime = 'experimental-edge'
const MonitorDetail = dynamic(() => import('@/components/MonitorDetail'), { ssr: false })

export default function Home({
  compactedStateStr,
  monitors,
}: {
  compactedStateStr: string
  monitors: MonitorTarget[]
  tooltip?: string
  statusPageLink?: string
}) {
  const { t } = useTranslation('common')
  let state = new CompactedMonitorStateWrapper(compactedStateStr).uncompact()

  // Specify monitorId in URL hash to view a specific monitor (can be used in iframe)
  const monitorId = window.location.hash.substring(1)
  if (monitorId) {
    const monitor = monitors.find((monitor) => monitor.id === monitorId)
    if (!monitor || !state) {
      return <Text fw={700}>{t('Monitor not found', { id: monitorId })}</Text>
    }
    return (
      <div style={{ maxWidth: '810px' }}>
        <MonitorDetail monitor={monitor} state={state} />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{pageConfig.title}</title>
        <link rel="icon" href={pageConfig.favicon ?? '/favicon.png'} />
        <link rel="canonical" href="https://status.marketmaker.cc/" />
      </Head>

      {state.lastUpdate === 0 ? (
        <Center>
          <Text fw={700}>{t('Monitor State not defined')}</Text>
        </Center>
      ) : (
        <MarketMakerStatus monitors={monitors} state={state} maintenances={maintenances} />
      )}
    </>
  )
}

export async function getServerSideProps() {
  const { workerConfig } = await import('@/uptime.config')
  // Read state as string from storage, to avoid hitting server-side cpu time limit
  const compactedStateStr = await getFromStore(process.env as any, 'state')

  // Only present these values to client
  const monitors = workerConfig.monitors.map((monitor) => {
    return {
      id: monitor.id,
      name: monitor.name,
      // @ts-ignore
      tooltip: monitor?.tooltip,
      // @ts-ignore
      statusPageLink: monitor?.statusPageLink,
      // @ts-ignore
      hideLatencyChart: monitor?.hideLatencyChart,
    }
  })

  return { props: { compactedStateStr, monitors } }
}
