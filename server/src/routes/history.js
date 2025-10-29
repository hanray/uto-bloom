// REQ: FR-SV-002 (Expose /history for 24h and 7d ranges)
// REQ: BR-SV-003 (Keep short history and tidy rollups)

const express = require('express');
const router = express.Router();

/**
 * GET /history
 * Retrieve historical readings for a device
 * Query params: device_id, range (24h or 7d)
 * 
 * NOTE: Per BRD, we use single-document model (no history collection)
 * For MVP, we generate mock historical data points
 * In production, you'd create a separate readings collection
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
    
    // Get current node state
    const nodes = req.db.collection('nodes');
    const node = await nodes.findOne({ _id: device_id });
    
    if (!node) {
      return res.status(404).json({
        success: false,
        error: 'Node not found'
      });
    }
    
    // Generate mock history based on current reading
    // In production, query actual readings collection
    const now = Math.floor(Date.now() / 1000);
    const hoursBack = range === '24h' ? 24 : 168;
    const intervalMinutes = range === '24h' ? 15 : 60;
    const readings = [];
    
    const currentValue = node.soil_raw || 500;
    
    for (let i = hoursBack * 60; i >= 0; i -= intervalMinutes) {
      const ts = now - (i * 60);
      // Add some variation around current value
      const variance = Math.random() * 100 - 50;
      const value = Math.max(0, Math.min(1023, currentValue + variance));
      
      readings.push({
        ts,
        soil_raw: Math.round(value),
        temp_c: node.temp_c || 22
      });
    }
    
    res.status(200).json({ 
      device_id,
      range,
      readings,
      note: 'Mock data - implement readings collection for production'
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
