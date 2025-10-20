# Uto Bloom - Feature Checklist
**Auto-derived from BRD v0.3**  
Last Updated: 2025-10-20

## Business Rules - Firmware & Device

- [ ] **BR-FW-001** - Take a reading on a regular schedule so the app stays current
  - Implementation: [`firmware/sampling.ino`](#)
  
- [ ] **BR-FW-002** - Only power the soil probe briefly during each reading
  - Implementation: [`firmware/power-management.ino`](#)
  
- [ ] **BR-FW-003** - Support optional two-step calibration per pot (Dry, then Wet)
  - Implementation: [`firmware/calibration.ino`](#)
  
- [ ] **BR-FW-004** - Send a small, well-formed JSON payload for each reading
  - Implementation: [`firmware/payload.ino`](#)

## Business Rules - Server & Data

- [ ] **BR-SV-001** - Accept each reading once and only once
  - Implementation: [`server/routes/ingest.js`](#)
  
- [ ] **BR-SV-002** - Reject obviously wrong timestamps
  - Implementation: [`server/middleware/validation.js`](#)
  
- [ ] **BR-SV-003** - Keep a short history and tidy rollups
  - Implementation: [`server/services/retention.js`](#)
  
- [ ] **BR-SV-004** - Compute and store the plant's current status from the latest readings
  - Implementation: [`server/services/status-engine.js`](#)

## Business Rules - UI/UX

- [ ] **BR-UX-001** - Home must be readable at a glance
  - Implementation: [`client/src/pages/Home.jsx`](#)
  
- [ ] **BR-UX-002** - Explain status changes
  - Implementation: [`client/src/pages/Details.jsx`](#)
  
- [ ] **BR-UX-003** - Search must feel instant
  - Implementation: [`client/src/components/PlantSearch.jsx`](#)
  
- [ ] **BR-UX-004** - Charts should show trends cleanly
  - Implementation: [`client/src/components/Charts.jsx`](#)

## Business Rules - Status Bands

- [ ] **BR-ST-001** - Show "Need water" for sustained dryness
  - Implementation: [`server/services/status-engine.js`](#)
  
- [ ] **BR-ST-002** - Show "I'm doing great" when moisture is in target range and temperature is comfortable
  - Implementation: [`server/services/status-engine.js`](#)
  
- [ ] **BR-ST-003** - Show "I'm cold" or "I'm hot" only for lasting problems
  - Implementation: [`server/services/status-engine.js`](#)
  
- [ ] **BR-ST-004** - Escalate to "In need of care!" for serious or combined issues
  - Implementation: [`server/services/status-engine.js`](#)

## Functional Requirements - Firmware (Node)

- [ ] **FR-FW-001** - Power the soil probe only during a reading and capture a stable value
  - Implementation: [`firmware/sensor-read.ino`](#)
  
- [ ] **FR-FW-002** - Provide a configurable reading schedule with a sensible default
  - Implementation: [`firmware/config.ino`](#)
  
- [ ] **FR-FW-003** - Post a compact JSON payload containing device ID, timestamp, soil reading, and temperature
  - Implementation: [`firmware/http-client.ino`](#)
  
- [ ] **FR-FW-004** - Buffer a small backlog while offline and send upon reconnect
  - Implementation: [`firmware/offline-buffer.ino`](#)
  
- [ ] **FR-FW-005** - Support optional Dry/Wet calibration steps stored per pot
  - Implementation: [`firmware/calibration.ino`](#)

## Functional Requirements - Server & Data

- [ ] **FR-SV-001** - Validate payloads, reject bad timestamps, and deduplicate by device+timestamp
  - Implementation: [`server/middleware/validation.js`](#)
  
- [ ] **FR-SV-002** - Expose /history for 24h and 7d ranges and a /live stream for recent updates
  - Implementation: [`server/routes/history.js`](#), [`server/routes/live.js`](#)
  
- [ ] **FR-SV-003** - Derive and store the current status from recent readings
  - Implementation: [`server/services/status-engine.js`](#)
  
- [ ] **FR-SV-004** - Apply retention: keep raw for months and summaries for a year
  - Implementation: [`server/services/retention.js`](#)

## Functional Requirements - PWA (Web/iOS/Android/TV)

- [ ] **FR-UI-001** - Home view shows image, status, last updated, and a 24h moisture mini-chart
  - Implementation: [`client/src/pages/Home.jsx`](#)
  
- [ ] **FR-UI-002** - Details view explains status changes with timestamps and current values
  - Implementation: [`client/src/pages/Details.jsx`](#)
  
- [ ] **FR-UI-003** - History view shows 24h and 7d charts that remain readable on small and large screens
  - Implementation: [`client/src/pages/History.jsx`](#)
  
- [ ] **FR-UI-004** - Onboarding includes a local, offline catalog search with type-ahead
  - Implementation: [`client/src/pages/Onboarding.jsx`](#)
  
- [ ] **FR-UI-005** - PWA manifest and service worker enable install on iOS/Android; TV layout prioritizes readability
  - Implementation: [`client/public/manifest.json`](#), [`client/src/service-worker.js`](#)

## Coverage Summary

**Total Requirements**: 29  
**Implemented**: 0  
**Coverage**: 0%

---

*This file is auto-generated. Run `npm run verify:features` to update coverage.*
