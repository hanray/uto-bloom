// REQ: BR-SV-004 (Compute and store current status)
// REQ: FR-SV-003 (Derive and store current status from recent readings)

const express = require('express');
const router = express.Router();

/**
 * GET /nodes/:id
 * Get current status and details for a specific node
 */
router.get('/nodes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Query MongoDB for node document
    // TODO: Include current status, last reading, calibration data
    // TODO: Calculate freshness (warn if > 30 min old)
    
    res.status(200).json({
      device_id: id,
      status: 'unknown',
      last_seen: null,
      soil_raw: null,
      message: 'Node status endpoint (stub)'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
