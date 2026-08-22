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

The Worker runs on the Cloudflare Free plan. Per-check success logs are intentionally omitted. Response-time history keeps one sample per 5-minute window (refreshed in place) within a 12-hour retention window and a 200-point-per-monitor cap, instead of recording every check. Re-parsing and re-serializing the state every minute is the dominant CPU cost, so the bounded history keeps routine checks within the available CPU budget, and the first run after any growth downsamples an oversized state automatically. Incident history is unaffected.

## Freshness check

The page is only trustworthy when its state is current. Check the public API:

```bash
curl -fsS https://status.marketmaker.cc/api/data
```

`updatedAt` should be no more than a few minutes old. If it is stale, inspect the scheduled Worker deployment, its cron trigger and the D1 binding before assuming that a green page means the services are healthy.

When the cron trigger exists but freshness still fails, check Workers Analytics for `exceededCpu`. Deploy the current `main` branch before changing the schedule or the database. Do not add paid-plan CPU limits to the Free-plan Worker.

## Safe incident test

Test notifications against a disposable endpoint or during an announced maintenance window. Confirm both the down and recovery messages; do not deliberately break a production service solely to test an alert.
