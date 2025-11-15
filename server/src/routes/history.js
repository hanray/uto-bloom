// REQ: FR-SV-002 (Expose /history for 24h and 7d ranges)
// REQ: BR-SV-003 (Keep short history and tidy rollups)

const express = require('express');
const router = express.Router();

/**
 * GET /history
 * Retrieve historical readings for a device from the readings collection
 * Query params: device_id, range (24h or 7d)
 */
router.get('/history', async (req, res) => {
  try {
    const { device_id, range } = req.query;
    
    if (!device_id) {
      return res.status(400).json({
        success: false,
        error: 'device_id required'
      });
    }
    
    if (!['24h', '7d'].includes(range)) {
      return res.status(400).json({
        success: false,
        error: 'range must be 24h or 7d'
      });
    }
    
    // Query actual readings from database
    const now = Math.floor(Date.now() / 1000);
    const hoursBack = range === '24h' ? 24 : 168;
    const startTs = now - (hoursBack * 3600);
    
    const readingsCollection = req.db.collection('readings');
    const readingsQuery = await readingsCollection
      .find({ 
        device_id, 
        ts: { $gte: startTs, $lte: now } 
      })
      .sort({ ts: 1 })
      .toArray();
    
    // Format readings for response
    const readings = readingsQuery.map(r => ({
      ts: r.ts,
      soil_raw: r.soil_raw,
      temp_c: r.temp_c,
      status: r.status
    }));
    
    console.log(`📊 History query: ${readings.length} readings for ${device_id} (${range})`);
    
    res.status(200).json({ 
      device_id,
      range,
      count: readings.length,
      readings
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
