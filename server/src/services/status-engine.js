// REQ: BR-ST-001 (Show "Need water" for sustained dryness)
// REQ: BR-ST-002 (Show "I'm doing great" when conditions optimal)
// REQ: BR-ST-003 (Show "I'm cold/hot" for lasting temperature problems)
// REQ: BR-ST-004 (Escalate to "In need of care!" for serious issues)
// REQ: BR-SV-004 (Compute and store plant's current status)
// REQ: FR-SV-003 (Derive and store current status)

/**
 * Status Engine
 * Determines plant status based on moisture and environmental readings
 */

const STATUS = {
  NEED_WATER: 'need_water',
  FINE: 'fine',
  GREAT: 'great',
  OVER_WET: 'over_wet',
  COLD: 'cold',
  HOT: 'hot',
  CARE: 'care',
  STALE: 'stale'
};

const THRESHOLDS = {
  DRY: 250,        // Below this = dry
  FINE_MIN: 250,   // Fine range start
  GREAT_MIN: 450,  // Great range start
  GREAT_MAX: 800,  // Great range end
  SOAKED: 850      // Above this = over-wet
};

/**
 * Compute status from current and recent readings
 * Implements 2-consecutive-check stability rule
 */
function computeStatus(currentReading, previousReadings = []) {
  // TODO: Implement BR-ST-001 - Need water detection (2 consecutive dry)
  // TODO: Implement BR-ST-002 - Doing great detection (in range, 2 checks)
  // TODO: Implement BR-ST-003 - Temperature alerts (sustained ~1 hour)
  // TODO: Implement BR-ST-004 - Critical care escalation
  // TODO: Check reading freshness (warn if > 30 min)
  // TODO: Apply debouncing (2 consecutive checks required)
  
  return {
    status: STATUS.FINE,
    reason: 'Status computation not yet implemented',
    moisture_band: 'unknown',
    temp_band: 'unknown',
    timestamp: new Date()
  };
}

/**
 * Check if reading is stale (> 30 minutes old)
 */
function isStalereading(timestamp) {
  const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
  return timestamp < thirtyMinutesAgo;
}

module.exports = {
  computeStatus,
  isStaleReading,
  STATUS,
  THRESHOLDS
};
