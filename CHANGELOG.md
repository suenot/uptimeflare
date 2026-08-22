# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.6] - 2026-08-22

### Fixed

- Unwedged scheduled monitoring after the state blob grew past the Free-plan CPU limit and every cron run failed with `exceededResources`: response-time history now keeps one sample per 5-minute window (refreshed in place) within the 12-hour window, and the first run downsamples any oversized stored state.

### Changed

- Capped response-time history at 200 points per monitor so the state blob stays bounded regardless of future retention changes.

## [0.3.5] - 2026-08-16

### Fixed

- Kept scheduled monitoring within the Free-plan CPU budget by starting a fresh short-term latency window instead of slicing every monitor history on each expiry.

### Changed

- Removed the paid-plan CPU-limit setting so the production deploy works on the current Cloudflare plan.

## [0.3.4] - 2026-08-16

### Fixed

- Restored scheduled checks after Cloudflare reported `exceededCpu` and monitoring state became stale.

### Changed

- Raised the scheduled Worker's CPU budget to 120 seconds and removed routine per-check success logs.
- Documented the CPU-overrun diagnosis in the monitoring runbook.

## [0.3.3] - 2026-08-16

### Fixed

- Restored the public `/api/data` endpoint after a configuration import was shadowed by its response object.
- Returned safe null latency values when a monitor has not yet stored a response-time record.

### Changed

- Updated the production monitoring guide for separated public, monitor and Worker configuration modules.

## [0.3.2] - 2026-08-16

### Changed

- Separated public page settings, monitor targets and Worker behavior into dedicated configuration modules.
- Added operational documentation for the scheduled Worker, D1 state, alert thresholds and freshness checks.

### Security

- Moved the Telegram token into a Worker-only module generated in CI so it cannot enter the browser-facing import graph.
- Removed unused password-protection and full-example configuration files that encouraged unsafe secret placement.

## [0.3.1] - 2026-08-16

### Fixed

- Grouped the Profitmaker terminal with the Profitmaker API instead of the MarketMaker platform.

## [0.3.0] - 2026-08-16

### Added

- Added per-project response-time chart accordions to keep detailed low-timeframe data available without crowding the status overview.

### Changed

- Reorganized all monitor groups around the public MarketMaker project catalog and clearly separated private and operational services.

## [0.2.1] - 2026-08-16

### Fixed

- Restyled the incident-history page with the MarketMaker status-page system and removed the upstream UptimeFlare footer.

## [0.2.0] - 2026-08-16

### Added

- A MarketMaker-branded status page with project-based monitor groups, 90-day availability bars, a stale-data warning, and an incident-history link.
- A MarketMaker logo sourced from the public marketmaker.cc landing project.

### Changed

- Reworked the upstream synchronization workflow so it merges upstream changes and stops on conflicts instead of deleting local customizations.

### Fixed

- Removed notification logging that could expose webhook URLs, headers, or payloads.

[Unreleased]: https://github.com/suenot/uptimeflare/compare/v0.3.6...HEAD
[0.3.6]: https://github.com/suenot/uptimeflare/compare/v0.3.5...v0.3.6
[0.3.5]: https://github.com/suenot/uptimeflare/compare/v0.3.4...v0.3.5
[0.3.4]: https://github.com/suenot/uptimeflare/compare/v0.3.3...v0.3.4
[0.3.3]: https://github.com/suenot/uptimeflare/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/suenot/uptimeflare/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/suenot/uptimeflare/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/suenot/uptimeflare/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/suenot/uptimeflare/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/suenot/uptimeflare/releases/tag/v0.2.0
