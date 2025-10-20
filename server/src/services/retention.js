// REQ: BR-SV-003 (Keep short history and tidy rollups)
// REQ: FR-SV-004 (Apply retention: keep raw for months, summaries for year)

/**
 * Data Retention Service
 * Manages cleanup of old readings and creation of summaries
 */

/**
 * Retention policy:
 * - Raw readings: Keep for 3 months
 * - Hourly summaries: Keep for 1 year
 * - Cleanup runs daily
 */
async function applyRetentionPolicy() {
  // TODO: Implement raw data cleanup (older than 3 months)
  // TODO: Create hourly summaries before deleting raw data
  // TODO: Clean up old hourly summaries (older than 1 year)
  // TODO: Log retention statistics
  
  console.log('Retention policy execution (stub)');
}

/**
 * Create hourly summary from raw readings
 */
async function createHourlySummary(deviceId, hour) {
  // TODO: Aggregate readings for the hour
  // TODO: Calculate min, max, avg, median
  // TODO: Store summary document
  // TODO: Return summary stats
  
  return {
    device_id: deviceId,
    hour,
    count: 0,
    soil_min: null,
    soil_max: null,
    soil_avg: null
  };
}

/**
 * Schedule retention policy to run daily
 */
function scheduleRetentionJob() {
  // TODO: Set up daily cron job
  // TODO: Run at off-peak hours
  
  console.log('Retention job scheduled (stub)');
}

module.exports = {
  applyRetentionPolicy,
  createHourlySummary,
  scheduleRetentionJob
};
