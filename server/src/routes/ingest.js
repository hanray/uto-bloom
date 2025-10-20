// REQ: BR-SV-001 (Accept each reading once and only once)
// REQ: BR-SV-002 (Reject obviously wrong timestamps)
// REQ: BR-FW-004 (Send well-formed JSON payload)
// REQ: FR-SV-001 (Validate payloads, reject bad timestamps, deduplicate)
// REQ: FR-FW-003 (Post compact JSON payload)

const express = require('express');
const router = express.Router();

/**
 * POST /ingest
 * Accept sensor readings from devices
 * 
 * Expected payload:
 * {
 *   device_id: string,
 *   ts: number (unix timestamp),
 *   soil: { raw: number, norm?: number },
 *   env: { temp_c?: number, rh?: number, lux?: number }
 * }
 */
router.post('/ingest', async (req, res) => {
  try {
    // TODO: Implement payload validation
    // TODO: Implement timestamp validation
    // TODO: Implement deduplication check
    // TODO: Store reading in MongoDB
    // TODO: Trigger status computation
    // TODO: Broadcast to WebSocket clients
    
    res.status(200).json({ 
      success: true, 
      message: 'Reading accepted (stub)' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
