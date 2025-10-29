// REQ: BR-SV-004 (Compute and store current status)
// REQ: FR-SV-003 (Derive and store current status from recent readings)

const express = require('express');
const router = express.Router();

/**
 * GET /nodes/:id
 * Get current status and details for a specific node
 * Per BRD: Return single document with latest state
 */
router.get('/nodes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const nodes = req.db.collection('nodes');
    const node = await nodes.findOne({ _id: id });
    
    if (!node) {
      return res.status(404).json({
        success: false,
        error: 'Node not found'
      });
    }
    
    // Check freshness (BR-UX-001: warn if > 30 min)
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const isStale = node.last_seen < thirtyMinsAgo;
    
    res.status(200).json({
      device_id: node._id,
      status: node.status,
      soil_raw: node.soil_raw,
      soil_norm: node.soil_norm,
      temp_c: node.temp_c,
      rh: node.rh,
      lux: node.lux,
      last_seen: node.last_seen,
      is_stale: isStale,
      calibrated: node.calibrated || false,
      dry_raw: node.dry_raw,
      wet_raw: node.wet_raw
    });
  } catch (error) {
    console.error('Nodes error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
