import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { MaintenanceConfig, MonitorTarget } from '@/types/config'
import { maintenances, pageConfig } from '@/uptime.config'
import styles from '@/styles/IncidentsPage.module.css'

export const runtime = 'experimental-edge'

function getSelectedMonth() {
  const hash = window.location.hash.replace('#', '')
  if (!hash) {
    const now = new Date()
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
  }
  return hash.split('-').slice(0, 2).join('-')
}

function filterIncidentsByMonth(
  incidents: MaintenanceConfig[],
  monthStr: string,
  monitors: MonitorTarget[]
): (Omit<MaintenanceConfig, 'monitors'> & { monitors: MonitorTarget[] })[] {
  return incidents
    .filter((incident) => {
      const date = new Date(incident.start)
      const incidentMonth = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0')
      return incidentMonth === monthStr
    })
    .map((incident) => ({
      ...incident,
      monitors: (incident.monitors ?? [])
        .map((id) => monitors.find((monitor) => monitor.id === id))
        .filter((monitor): monitor is MonitorTarget => Boolean(monitor)),
    }))
    .sort((a, b) => Number(new Date(b.start)) - Number(new Date(a.start)))
}

function getPrevNextMonth(monthStr: string) {
  const [year, month] = monthStr.split('-').map(Number)
  const date = new Date(year, month - 1)
  const prev = new Date(date)
  prev.setMonth(prev.getMonth() - 1)
  const next = new Date(date)
  next.setMonth(next.getMonth() + 1)
  const format = (value: Date) =>
    value.getFullYear() + '-' + String(value.getMonth() + 1).padStart(2, '0')

  return { prev: format(prev), next: format(next) }
}

function formatDate(value: number | string | undefined) {
  return value ? new Date(value).toLocaleString() : 'Not specified'
}

export default function IncidentsPage({ monitors }: { monitors: MonitorTarget[] }) {
  const [selectedMonitor, setSelectedMonitor] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(getSelectedMonth())

  useEffect(() => {
    const onHashChange = () => setSelectedMonth(getSelectedMonth())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const filteredIncidents = filterIncidentsByMonth(maintenances, selectedMonth, monitors)
  const visibleIncidents = selectedMonitor
    ? filteredIncidents.filter((incident) =>
        incident.monitors.some((monitor) => monitor.id === selectedMonitor)
      )
    : filteredIncidents
  const { prev, next } = getPrevNextMonth(selectedMonth)

  return (
    <>
      <Head>
        <title>Incident history | {pageConfig.title}</title>
        <link rel="icon" href={pageConfig.favicon ?? '/favicon.png'} />
        <link rel="canonical" href="https://status.marketmaker.cc/incidents" />
      </Head>

      <div className={styles.page}>
        <main className={styles.wrap}>
          <header className={styles.header}>
            <Link className={styles.brand} href="/" aria-label="marketmaker.cc status">
              {/* This is a small brand mark, so image optimization adds no value. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pageConfig.logo ?? '/marketmaker-logo.svg'} alt="MarketMaker" />
              <span>marketmaker.cc</span>
            </Link>
            <nav className={styles.nav} aria-label="Status navigation">
              <Link href="/">Status</Link>
              <span aria-current="page">Incident history</span>
            </nav>
          </header>

          <section className={styles.intro} aria-labelledby="incident-history-title">
            <p>Availability record</p>
            <h1 id="incident-history-title">Incident history</h1>
            <span>Scheduled maintenance and resolved availability incidents.</span>
          </section>

          <section className={styles.controls} aria-label="Incident filters">
            <label htmlFor="monitor">Component</label>
            <select
              id="monitor"
              value={selectedMonitor}
              onChange={(event) => setSelectedMonitor(event.target.value)}
            >
              <option value="">All components</option>
              {monitors.map((monitor) => (
                <option key={monitor.id} value={monitor.id}>
                  {monitor.name}
                </option>
              ))}
            </select>
          </section>

          {visibleIncidents.length === 0 ? (
            <section className={styles.empty} aria-live="polite">
              <span className={styles.info} aria-hidden="true">i</span>
              <div>
                <h2>No incidents in this month</h2>
                <p>There are no scheduled maintenance events or resolved incidents for {selectedMonth}.</p>
              </div>
            </section>
          ) : (
            <section className={styles.incidents} aria-label="Incidents">
              {visibleIncidents.map((incident, index) => (
                <article className={styles.incident} key={`${incident.start}-${index}`}>
                  <p className={styles.incidentLabel}>Maintenance record</p>
                  <h2>{incident.title ?? 'Scheduled maintenance'}</h2>
                  <p>{incident.body}</p>
                  <dl>
                    <div>
                      <dt>Started</dt>
                      <dd>{formatDate(incident.start)}</dd>
                    </div>
                    <div>
                      <dt>Ended</dt>
                      <dd>{formatDate(incident.end)}</dd>
                    </div>
                  </dl>
                  {incident.monitors.length > 0 && (
                    <p className={styles.affected}>
                      <strong>Affected:</strong> {incident.monitors.map((monitor) => monitor.name).join(', ')}
                    </p>
                  )}
                </article>
              ))}
            </section>
          )}

          <nav className={styles.months} aria-label="Incident months">
            <a href={`#${prev}`}>Previous month</a>
            <strong>{selectedMonth}</strong>
            <a href={`#${next}`}>Next month</a>
          </nav>

          <footer className={styles.footer}>
            <span>External monitoring from Cloudflare Workers.</span>
            <Link href="/">View current status</Link>
          </footer>
        </main>
      </div>
    </>
  )
}

export async function getServerSideProps() {
  const { workerConfig } = await import('@/uptime.config')
  const monitors: MonitorTarget[] = workerConfig.monitors.map((monitor) => ({
    id: monitor.id,
    name: monitor.name,
  })) as MonitorTarget[]
  return { props: { monitors } }
}
