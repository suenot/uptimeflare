# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/suenot/uptimeflare/compare/v0.3.2...HEAD
[0.3.2]: https://github.com/suenot/uptimeflare/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/suenot/uptimeflare/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/suenot/uptimeflare/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/suenot/uptimeflare/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/suenot/uptimeflare/releases/tag/v0.2.0
