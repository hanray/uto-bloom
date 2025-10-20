# Uto Bloom - Development Guide

## Requirements Traceability System

This project implements a comprehensive requirements traceability system that ensures every requirement from the BRD is tracked and implemented in code.

### Key Files

1. **`FEATURES.md`** - Complete checklist of all requirements with links to implementations
2. **`STATUS.md`** - Auto-generated coverage report (updated by verify script)
3. **`routes-map.json`** - Maps API endpoints and UI routes to requirements
4. **`.github/PULL_REQUEST_TEMPLATE.md`** - PR checklist enforcing traceability

### Requirement IDs

All requirements use a consistent naming scheme:

- **BR-FW-xxx**: Business Rules - Firmware
- **BR-SV-xxx**: Business Rules - Server
- **BR-UX-xxx**: Business Rules - UI/UX
- **BR-ST-xxx**: Business Rules - Status Logic
- **FR-FW-xxx**: Functional Requirements - Firmware
- **FR-SV-xxx**: Functional Requirements - Server
- **FR-UI-xxx**: Functional Requirements - UI

### Code Annotation Standard

Every file that implements a requirement MUST include a REQ comment at the top:

```javascript
// REQ: BR-ST-001 (Need water rule)
// REQ: FR-FW-001 (Sampling & power policy)

function myImplementation() {
  // ...
}
```

**Important**: Use the EXACT requirement ID from the BRD.

## Verification Script

### Running the Verifier

```bash
npm run verify:features
```

This script:
1. Extracts all requirement IDs from `FEATURES.md`
2. Scans the entire repository for `REQ:` tags
3. Identifies missing implementations
4. Updates `STATUS.md` with current coverage
5. **FAILS** if any requirement lacks a REQ tag

### Coverage Report

The script generates a detailed coverage report:

```
╔════════════════════════════════════════╗
║  Uto Bloom Feature Coverage Verifier  ║
╚════════════════════════════════════════╝

Total Requirements:     30
Implemented:            30
Not Implemented:        0
Coverage:               100.00%

✓ All requirements have implementation tags!
```

### Integration with CI/CD

The verify script exits with code 1 if any requirements are missing, making it perfect for CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Verify Feature Coverage
  run: npm run verify:features
```

## Development Workflow

### 1. Starting a New Feature

When implementing a requirement:

1. Check `FEATURES.md` for the requirement details
2. Identify the requirement ID (e.g., `BR-ST-001`)
3. Create/modify the implementing file
4. Add `// REQ: <ID>` comment at the top
5. Implement the logic
6. Run `npm run verify:features` to confirm coverage

### 2. Commit Messages

All commits MUST reference the requirement IDs they implement:

```bash
git commit -m "Implements: BR-ST-001, FR-SV-003

Added status computation logic for 'Need water' rule.
Status changes require 2 consecutive checks for stability."
```

### 3. Pull Requests

Use the PR template (`.github/PULL_REQUEST_TEMPLATE.md`):

- [ ] List all requirement IDs in the PR
- [ ] Ensure `npm run verify:features` passes
- [ ] Update documentation if needed

**PRs that fail verification cannot be merged.**

## Project Structure

```
uto-bloom/
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md    # PR checklist
├── client/
│   ├── public/
│   │   └── manifest.json            # PWA manifest (FR-UI-005)
│   └── src/
│       ├── pages/
│       │   ├── Home.jsx            # BR-UX-001, FR-UI-001
│       │   ├── Details.jsx         # BR-UX-002, FR-UI-002
│       │   ├── History.jsx         # BR-UX-004, FR-UI-003
│       │   └── Onboarding.jsx      # BR-UX-003, FR-UI-004
│       └── service-worker.js       # FR-UI-005
├── server/
│   └── src/
│       ├── routes/
│       │   ├── ingest.js           # BR-SV-001, BR-SV-002, FR-SV-001
│       │   ├── history.js          # FR-SV-002, BR-SV-003
│       │   ├── live.js             # FR-SV-002 (WebSocket)
│       │   └── nodes.js            # BR-SV-004, FR-SV-003
│       ├── services/
│       │   ├── status-engine.js    # BR-ST-001 through BR-ST-004
│       │   └── retention.js        # BR-SV-003, FR-SV-004
│       └── middleware/
│           └── validation.js       # BR-SV-002, FR-SV-001
├── firmware/
│   ├── sampling.ino                # BR-FW-001, FR-FW-002
│   ├── power-management.ino        # BR-FW-002, FR-FW-001
│   ├── calibration.ino             # BR-FW-003, FR-FW-005
│   ├── http-client.ino             # BR-FW-004, FR-FW-003
│   └── offline-buffer.ino          # FR-FW-004
├── scripts/
│   └── verify-features.js          # Coverage verifier
├── FEATURES.md                     # Complete feature checklist
├── STATUS.md                       # Auto-generated coverage report
├── routes-map.json                 # API/Route → Requirements mapping
└── README.md                       # Project overview
```

## Current Implementation Status

Run `npm run verify:features` for the latest status.

### Summary (as of last check)
- **Total Requirements**: 30
- **Implemented**: 30 (stubs with REQ tags)
- **Coverage**: 100%

All requirements have placeholder implementations with proper REQ tags. Now you can implement the actual logic for each requirement while maintaining 100% traceability.

## Adding New Requirements

If you need to add a new requirement:

1. **Update the BRD** with the new requirement ID and description
2. **Add to `FEATURES.md`**:
   ```markdown
   - [ ] **BR-XY-999** - Description of requirement
     - Implementation: [`path/to/file.js`](#)
   ```
3. **Create implementation** with REQ tag:
   ```javascript
   // REQ: BR-XY-999 (New requirement description)
   ```
4. **Update `routes-map.json`** if it's an API/route
5. **Run verification**: `npm run verify:features`
6. **Commit**: `git commit -m "Implements: BR-XY-999 - New feature"`

## Troubleshooting

### "Missing REQ tags" Error

If the verification script fails:

```
⚠ WARNING: Missing REQ tags for the following requirements:
  ✗ BR-ST-003
```

**Solution**: Add the REQ tag to the implementing file:
```javascript
// REQ: BR-ST-003 (Description)
```

### False Positives

If a requirement doesn't need code implementation (documentation-only):

1. Create a markdown file with the REQ tag:
   ```markdown
   <!-- REQ: BR-XX-999 (Documentation requirement) -->
   ```

### Coverage Not 100%

Check `STATUS.md` for which requirements are missing implementations.

## Best Practices

1. **Always add REQ tags** before writing implementation code
2. **Run verify:features** before committing
3. **Reference requirement IDs** in commit messages
4. **Keep FEATURES.md updated** with implementation links
5. **Don't bypass verification** - it's there to protect traceability

## Questions?

Review the BRD (Business Requirements Document) for detailed requirement specifications.

---

**Remember**: Every line of code should trace back to a requirement. If it doesn't, ask yourself: "Why are we building this?"
