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
  OKAY_MIN: 450,   // Okay range start
  GREAT_MIN: 600,  // Great range start
  SOAKED: 1024     // Above max (effectively disabled)
};

/**
 * Compute status from current reading
 * Updated rules:
 * - Need water: raw < 250 (dry)
 * - Getting low but I'm okay: 250 ≤ raw < 450
 * - I'm okay: 450 ≤ raw < 600
 * - I'm doing great: raw ≥ 600
 * 
 * Note: For MVP single-document model, we simplify to instant status
 */
function computeStatus(soilRaw, tempC = null) {
  let status = STATUS.FINE;
  let reason = '';
  
  // Moisture bands
  if (soilRaw < 250) {
    status = STATUS.NEED_WATER;
    reason = 'Soil moisture is low - time to water';
  } else if (soilRaw >= 250 && soilRaw < 450) {
    status = STATUS.FINE;
    reason = 'Getting low but I\'m okay';
  } else if (soilRaw >= 450 && soilRaw < 600) {
    status = STATUS.FINE;
    reason = 'I\'m okay';
  } else if (soilRaw >= 600) {
    status = STATUS.GREAT;
    reason = 'I\'m doing great!';
  }
  
  // Temperature checks (if available)
  if (tempC !== null) {
    if (tempC < 15) {
      status = STATUS.COLD;
      reason = "I'm cold - temperature is too low";
    } else if (tempC > 30) {
      status = STATUS.HOT;
      reason = "I'm hot - temperature is too high";
    }
  }
  
  // Only extreme temp issues trigger CARE now
  if ((status === STATUS.COLD || status === STATUS.HOT) && soilRaw < 250) {
    status = STATUS.CARE;
    reason = 'Multiple issues detected - needs attention!';
  }
  
  return status;
}

/**
 * Check if reading is stale (> 30 minutes old)
 */
function isStaleReading(timestamp) {
  const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
  return timestamp < thirtyMinutesAgo;
}

module.exports = {
  computeStatus,
  isStaleReading,
  STATUS,
  THRESHOLDS
};
