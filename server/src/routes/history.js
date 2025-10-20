// REQ: FR-SV-002 (Expose /history for 24h and 7d ranges)
// REQ: BR-SV-003 (Keep short history and tidy rollups)

const express = require('express');
const router = express.Router();

/**
 * GET /history
 * Retrieve historical readings for a device
 * Query params: device_id, range (24h or 7d)
 */
router.get('/history', async (req, res) => {
  try {
    const { device_id, range } = req.query;
    
    // TODO: Validate device_id
    // TODO: Validate range parameter (24h or 7d)
    // TODO: Query MongoDB for readings in range
    // TODO: Apply appropriate data aggregation
    // TODO: Return formatted data for charts
    
    res.status(200).json({ 
      device_id,
      range,
      readings: [],
      message: 'History endpoint (stub)' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
