# Monitoring architecture

The status system consists of a Cloudflare Pages status page, a scheduled Cloudflare Worker and one D1 database.

```text
Cloudflare cron -> scheduled checker -> D1 <- status page /api/data
                         |
                         -> Telegram down and recovery notifications
```

## Configuration boundaries

- `config/page.ts` contains branding, public project groups and maintenance windows.
- `config/monitors.ts` contains monitor targets and expected responses. Treat it as operational data: it must not contain credentials, authorization headers or private-only endpoints.
- `config/worker.ts` contains Worker behavior such as alert grace periods. It intentionally contains no notification URL or token.
- `worker/notification.secret.ts` is generated only in CI from the `TELEGRAM_BOT_TOKEN` GitHub secret. It is ignored by Git and imported only by the scheduled Worker.

This separation prevents the notification token from entering the browser-facing status-page import graph. Worker logs must never print webhook URLs, request headers, payloads or response bodies.

## Alert behavior

The checker runs every minute. A one-minute grace period means an endpoint must fail twice before a down alert is sent. A recovery alert is sent after the endpoint responds successfully again. Maintenance windows suppress notifications for their listed monitor IDs.

The Worker runs on the Cloudflare Free plan. The scheduled invocation sends monitor checks to the existing `RemoteChecker` Durable Object in batches of ten, then processes all results and remains the sole D1 state writer and alert sender. Each batch checks at most five endpoints concurrently. Checks without a configured timeout use eight seconds so sustained outages stay within the Free Durable Object duration quota. If a batch fails, the scheduled invocation does not write partial results or send false down alerts. Per-check success logs are intentionally omitted. Response-time history keeps one sample per 5-minute window (refreshed in place) within a 12-hour retention window and a 200-point-per-monitor cap; an oversized older state is downsampled on the next successful run. Incident history is unaffected.

## Freshness check

The page is only trustworthy when its state is current. Check the public API:

```bash
curl -fsS https://status.marketmaker.cc/api/data
```

`updatedAt` should be no more than a few minutes old. If it is stale, inspect the scheduled Worker deployment, its cron trigger and the D1 binding before assuming that a green page means the services are healthy.

When the cron trigger exists but freshness still fails, check Workers Analytics for `exceededCpu`. Deploy the current `main` branch before changing the schedule or the database. Do not add paid-plan CPU limits to the Free-plan Worker.

## Safe incident test

Test notifications against a disposable endpoint or during an announced maintenance window. Confirm both the down and recovery messages; do not deliberately break a production service solely to test an alert.
