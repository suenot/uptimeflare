import { MonitorTarget } from '../../types/config'
import { maintenances } from '../../config/page'
import { workerConfig } from '../../config/worker'
import { TELEGRAM_BOT_TOKEN } from '../notification.secret'

type WebhookConfig = {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH'
  headers?: Record<string, string | number>
  payloadType: 'param' | 'json' | 'x-www-form-urlencoded'
  payload: Record<string, unknown>
  timeout?: number
}

async function getWorkerLocation() {
  const res = await fetch('https://cloudflare.com/cdn-cgi/trace')
  const text = await res.text()

  const colo = /^colo=(.*)$/m.exec(text)?.[1]
  return colo
}

const fetchTimeout = (
  url: string,
  ms: number,
  { signal, ...options }: RequestInit<RequestInitCfProperties> | undefined = {}
): Promise<Response> => {
  const controller = new AbortController()
  const promise = fetch(url, { signal: controller.signal, ...options })
  if (signal) signal.addEventListener('abort', () => controller.abort())
  const timeout = setTimeout(() => controller.abort(), ms)
  return promise.finally(() => clearTimeout(timeout))
}

function withTimeout<T>(millis: number, promise: Promise<T>): Promise<T> {
  const timeout = new Promise<T>((resolve, reject) =>
    setTimeout(() => reject(new Error(`Promise timed out after ${millis}ms`)), millis)
  )

  return Promise.race([promise, timeout])
}

function formatStatusChangeNotification(
  monitor: any,
  isUp: boolean,
  timeIncidentStart: number,
  timeNow: number,
  reason: string,
  timeZone: string
) {
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timeZone,
  })

  let downtimeDuration = Math.round((timeNow - timeIncidentStart) / 60)
  const timeNowFormatted = dateFormatter.format(new Date(timeNow * 1000))
  const timeIncidentStartFormatted = dateFormatter.format(new Date(timeIncidentStart * 1000))

  if (isUp) {
    return `✅ ${monitor.name} is up! \nThe service is up again after being down for ${downtimeDuration} minutes.`
  } else if (timeNow == timeIncidentStart) {
    return `🔴 ${
      monitor.name
    } is currently down. \nService is unavailable at ${timeNowFormatted}. \nIssue: ${
      reason || 'unspecified'
    }`
  } else {
    return `🔴 ${
      monitor.name
    } is still down. \nService is unavailable since ${timeIncidentStartFormatted} (${downtimeDuration} minutes). \nIssue: ${
      reason || 'unspecified'
    }`
  }
}

function templateWebhookPlayload(payload: any, message: string) {
  for (const key in payload) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      if (payload[key] === '$MSG') {
        payload[key] = message
      } else if (typeof payload[key] === 'object' && payload[key] !== null) {
        templateWebhookPlayload(payload[key], message)
      }
    }
  }
}

async function webhookNotify(webhook: WebhookConfig, message: string) {
  // Webhook URLs, headers, and payloads can carry credentials. Keep invocation
  // logs useful without allowing a notification to disclose a secret.
  console.log(`Sending ${webhook.payloadType} webhook notification`)
  try {
    let url = webhook.url
    let method = webhook.method
    let headers = new Headers(webhook.headers as any)
    let payloadTemplated: { [key: string]: string | number } = JSON.parse(
      JSON.stringify(webhook.payload)
    )
    templateWebhookPlayload(payloadTemplated, message)
    let body = undefined

    switch (webhook.payloadType) {
      case 'param':
        method = method ?? 'GET'
        const urlTmp = new URL(url)
        for (const [k, v] of Object.entries(payloadTemplated)) {
          urlTmp.searchParams.append(k, v.toString())
        }
        url = urlTmp.toString()
        break
      case 'json':
        method = method ?? 'POST'
        if (headers.get('content-type') === null) {
          headers.set('content-type', 'application/json')
        }
        body = JSON.stringify(payloadTemplated)
        break
      case 'x-www-form-urlencoded':
        method = method ?? 'POST'
        if (headers.get('content-type') === null) {
          headers.set('content-type', 'application/x-www-form-urlencoded')
        }
        body = new URLSearchParams(payloadTemplated as any).toString()
        break
      default:
        throw 'Unrecognized payload type: ' + webhook.payloadType
    }

    const resp = await fetchTimeout(url, webhook.timeout ?? 5000, { method, headers, body })

    if (!resp.ok) {
      console.log('Webhook notification failed, status: ' + resp.status)
    } else {
      console.log('Webhook notification sent successfully, code: ' + resp.status)
    }
  } catch (e) {
    console.log('Webhook notification failed before a response was received')
  }
}

// Auxiliary function to format notification and send it via webhook
const formatAndNotify = async (
  monitor: MonitorTarget,
  isUp: boolean,
  timeIncidentStart: number,
  timeNow: number,
  reason: string
) => {
  // Skip notification if monitor is in the skip list
  const skipList = workerConfig.notification?.skipNotificationIds
  if (skipList && skipList.includes(monitor.id)) {
    console.log(`Skipping notification for ${monitor.name} (${monitor.id} in skipNotificationIds)`)
    return
  }

  // Skip notification if monitor is in maintenance
  const maintenanceList = maintenances
    .filter(
      (m) =>
        new Date(timeNow * 1000) >= new Date(m.start) &&
        (!m.end || new Date(timeNow * 1000) <= new Date(m.end))
    )
    .map((e) => e.monitors || [])
    .flat()

  if (maintenanceList.includes(monitor.id)) {
    console.log(`Skipping notification for ${monitor.name} (in maintenance)`)
    return
  }

  const notification = formatStatusChangeNotification(
    monitor,
    isUp,
    timeIncidentStart,
    timeNow,
    reason,
    workerConfig.notification?.timeZone ?? 'Etc/GMT'
  )
  await webhookNotify(
    {
      url: `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      payloadType: 'json',
      payload: {
        chat_id: '-5509203256',
        text: '$MSG',
      },
    },
    notification
  )
}

export {
  getWorkerLocation,
  fetchTimeout,
  withTimeout,
  webhookNotify,
  formatStatusChangeNotification,
  formatAndNotify,
}
