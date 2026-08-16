import { MaintenanceConfig, MonitorState, MonitorTarget } from '@/types/config'
import { pageConfig } from '@/uptime.config'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from '@/styles/StatusPage.module.css'

type BarStatus = 'up' | 'down' | 'partial' | 'unknown'

const DAY_SECONDS = 24 * 60 * 60
const HISTORY_DAYS = 90
const DetailChart = dynamic(() => import('@/components/DetailChart'), { ssr: false })

function currentIncident(monitor: MonitorTarget, state: MonitorState) {
  const incidents = state.incident[monitor.id]
  return incidents?.[incidents.length - 1]
}

function isUp(monitor: MonitorTarget, state: MonitorState) {
  const incident = currentIncident(monitor, state)
  return incident ? incident.end !== null : false
}

function getBars(monitor: MonitorTarget, state: MonitorState, now: number): BarStatus[] {
  const incidents = state.incident[monitor.id] ?? []
  const monitoredSince = incidents[0]?.start[0]

  return Array.from({ length: HISTORY_DAYS }, (_, index) => {
    const dayStart = now - (HISTORY_DAYS - index) * DAY_SECONDS
    const dayEnd = dayStart + DAY_SECONDS
    const observedStart = monitoredSince ? Math.max(dayStart, monitoredSince) : dayEnd
    const observedSeconds = Math.max(0, dayEnd - observedStart)

    if (observedSeconds === 0) return 'unknown'

    const downSeconds = incidents.reduce((total, incident) => {
      const incidentStart = Math.max(observedStart, incident.start[0])
      const incidentEnd = Math.min(dayEnd, incident.end ?? now)
      return total + Math.max(0, incidentEnd - incidentStart)
    }, 0)

    if (downSeconds === 0) return 'up'
    if (downSeconds >= observedSeconds) return 'down'
    return 'partial'
  })
}

function getUptime(monitor: MonitorTarget, state: MonitorState, now: number) {
  const incidents = state.incident[monitor.id] ?? []
  const monitoredSince = incidents[0]?.start[0]
  if (!monitoredSince) return null

  const totalSeconds = Math.max(0, now - monitoredSince)
  const downSeconds = incidents.reduce(
    (total, incident) => total + Math.max(0, Math.min(now, incident.end ?? now) - incident.start[0]),
    0
  )

  return totalSeconds === 0 ? null : Math.max(0, ((totalSeconds - downSeconds) / totalSeconds) * 100)
}

function formatAge(seconds: number) {
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m ago`
}

function isInMaintenance(monitorId: string, maintenances: MaintenanceConfig[], now: number) {
  return maintenances.some((maintenance) => {
    const start = new Date(maintenance.start).getTime() / 1000
    const end = maintenance.end ? new Date(maintenance.end).getTime() / 1000 : Infinity
    return maintenance.monitors?.includes(monitorId) && now >= start && now <= end
  })
}

function MonitorRow({
  monitor,
  state,
  maintenances,
  now,
}: {
  monitor: MonitorTarget
  state: MonitorState
  maintenances: MaintenanceConfig[]
  now: number
}) {
  const up = isUp(monitor, state)
  const maintenance = isInMaintenance(monitor.id, maintenances, now)
  const uptime = getUptime(monitor, state, now)
  const bars = getBars(monitor, state, now)
  const lastLatency = state.latency[monitor.id]?.slice(-1)[0]
  const status = maintenance ? 'partial' : up ? 'up' : 'down'

  return (
    <article className={styles.row}>
      <div className={styles.name} title={monitor.tooltip}>
        <span className={`${styles.dot} ${styles[status]}`} aria-hidden="true" />
        <span>{monitor.name}</span>
      </div>
      <div className={styles.meta}>
        {uptime === null ? 'Awaiting data' : `${uptime.toFixed(2)}% uptime`}
        {lastLatency && ` · ${lastLatency.ping} ms`}
      </div>
      <div className={styles.bar} aria-label={`90 day availability for ${monitor.name}`}>
        {bars.map((bar, index) => (
          <i
            key={index}
            className={styles[bar]}
            title={`${index === HISTORY_DAYS - 1 ? 'Today' : `${HISTORY_DAYS - index} days ago`}: ${bar}`}
          />
        ))}
      </div>
      <div className={styles.legend}>
        <span>90 days ago</span>
        <span>Today</span>
      </div>
    </article>
  )
}

function ProjectGroup({
  groupName,
  groupMonitors,
  state,
  maintenances,
  now,
}: {
  groupName: string
  groupMonitors: MonitorTarget[]
  state: MonitorState
  maintenances: MaintenanceConfig[]
  now: number
}) {
  const [chartsOpen, setChartsOpen] = useState(false)

  return (
    <section className={styles.group} aria-labelledby={`group-${groupName}`}>
      <h2 id={`group-${groupName}`}>{groupName}</h2>
      <div className={styles.card}>
        {groupMonitors.map((monitor) => (
          <MonitorRow
            key={monitor.id}
            monitor={monitor}
            state={state}
            maintenances={maintenances}
            now={now}
          />
        ))}
        <details
          className={styles.charts}
          onToggle={(event) => setChartsOpen((event.currentTarget as HTMLDetailsElement).open)}
        >
          <summary>
            <span>Response-time charts</span>
            <span>Last 12 hours</span>
          </summary>
          {chartsOpen && (
            <div className={styles.chartGrid}>
              {groupMonitors.map((monitor) => (
                <section className={styles.chart} key={monitor.id}>
                  <h3>{monitor.name}</h3>
                  {state.latency[monitor.id]?.length ? (
                    <DetailChart monitor={monitor} state={state} appearance="status" />
                  ) : (
                    <p>No response-time data yet.</p>
                  )}
                </section>
              ))}
            </div>
          )}
        </details>
      </div>
    </section>
  )
}

export default function MarketMakerStatus({
  monitors,
  state,
  maintenances,
}: {
  monitors: MonitorTarget[]
  state: MonitorState
  maintenances: MaintenanceConfig[]
}) {
  const [now, setNow] = useState(() => Math.round(Date.now() / 1000))

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Math.round(Date.now() / 1000)), 30_000)
    return () => window.clearInterval(interval)
  }, [])

  const staleSeconds = Math.max(0, now - state.lastUpdate)
  const visibleMonitors = monitors.filter((monitor) =>
    Object.values(pageConfig.group ?? {}).some((ids) => ids.includes(monitor.id))
  )
  const downCount = visibleMonitors.filter((monitor) => !isUp(monitor, state)).length
  const isOperational = visibleMonitors.length > 0 && downCount === 0
  const statusText = isOperational
    ? 'All systems operational'
    : `${downCount} of ${visibleMonitors.length} systems need attention`

  return (
    <div className={styles.page}>
      <main className={styles.wrap}>
        <header className={styles.header}>
          <a className={styles.brand} href="https://marketmaker.cc" aria-label="marketmaker.cc">
            <img src={pageConfig.logo ?? '/marketmaker-logo.svg'} alt="" />
            <span>marketmaker.cc</span>
          </a>
          <Link className={styles.incidentsLink} href="/incidents">
            Incident history
          </Link>
        </header>

        <section aria-live="polite">
          <div className={styles.banner}>
            <span className={`${styles.dot} ${isOperational ? styles.up : styles.down}`} />
            <h1>{statusText}</h1>
          </div>
          <p className={styles.sub}>
            Last updated {formatAge(staleSeconds)} from Cloudflare edge checks.
          </p>
          {staleSeconds > 300 && (
            <p className={styles.stale}>
              Monitoring data is overdue. Checks may not be running; the displayed status can be stale.
            </p>
          )}
        </section>

        {Object.entries(pageConfig.group ?? {}).map(([groupName, ids]) => {
          const groupMonitors = monitors.filter((monitor) => ids.includes(monitor.id))
          if (groupMonitors.length === 0) return null

          return (
            <ProjectGroup
              key={groupName}
              groupName={groupName}
              groupMonitors={groupMonitors}
              state={state}
              maintenances={maintenances}
              now={now}
            />
          )
        })}

        <footer className={styles.footer}>
          <span>External monitoring from Cloudflare Workers.</span>
          <Link href="/api/data">JSON status API</Link>
        </footer>
      </main>
    </div>
  )
}
