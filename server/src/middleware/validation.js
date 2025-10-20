// REQ: BR-SV-002 (Reject obviously wrong timestamps)
// REQ: FR-SV-001 (Validate payloads, reject bad timestamps)

/**
 * Request Validation Middleware
 * Validates incoming sensor payloads
 */

/**
 * Validate timestamp is reasonable
 * Reject if too far in past or future
 */
function validateTimestamp(timestamp) {
  const now = Date.now() / 1000; // Convert to seconds
  const oneHourAgo = now - 3600;
  const fiveMinutesFromNow = now + 300;
  
  // TODO: Implement configurable time window
  // TODO: Log validation failures
  
  if (timestamp < oneHourAgo) {
    return { valid: false, reason: 'Timestamp too far in past' };
  }
  
  if (timestamp > fiveMinutesFromNow) {
    return { valid: false, reason: 'Timestamp in future' };
  }
  
  return { valid: true };
}

/**
 * Validate sensor payload structure
 */
function validatePayload(payload) {
  // TODO: Validate device_id presence
  // TODO: Validate timestamp format
  // TODO: Validate soil reading range (0-1023)
  // TODO: Validate optional fields (temp, rh, lux)
  
  if (!payload.device_id) {
    return { valid: false, reason: 'Missing device_id' };
  }
  
  if (!payload.ts) {
    return { valid: false, reason: 'Missing timestamp' };
  }
  
  return { valid: true };
}

/**
 * Express middleware for payload validation
 */
function validationMiddleware(req, res, next) {
  const payload = req.body;
  
  const payloadCheck = validatePayload(payload);
  if (!payloadCheck.valid) {
    return res.status(400).json({
      success: false,
      error: payloadCheck.reason
    });
  }
  
  const timestampCheck = validateTimestamp(payload.ts);
  if (!timestampCheck.valid) {
    return res.status(400).json({
      success: false,
      error: timestampCheck.reason
    });
  }
  
  next();
}

module.exports = {
  validateTimestamp,
  validatePayload,
  validationMiddleware
};
