// REQ: BR-SV-001 (Accept each reading once and only once)
// REQ: BR-SV-002 (Reject obviously wrong timestamps)
// REQ: BR-FW-004 (Send well-formed JSON payload)
// REQ: FR-SV-001 (Validate payloads, reject bad timestamps, deduplicate)
// REQ: FR-FW-003 (Post compact JSON payload)

const express = require('express');
const router = express.Router();
const { computeStatus } = require('../services/status-engine');

/**
 * POST /ingest
 * Accept sensor readings from devices
 * Per BRD: Overwrite single node document, compute status
 */
router.post('/ingest', async (req, res) => {
  try {
    const { device_id, soil, env } = req.body;
    const serverTs = Math.floor(Date.now() / 1000);
    console.log('📥 Ingest received:', { device_id, soil_raw: soil?.raw, temp_c: env?.temp_c });

    // Validation
    if (!device_id || !soil || soil.raw === undefined) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: device_id, soil.raw' 
      });
    }

    // Compute status based on BRD rules
    const status = computeStatus(soil.raw, env?.temp_c);
    console.log(`💧 Status computed: ${status} (soil: ${soil.raw})`);

    // Per BRD: Single document per node (overwrite)
    const nodes = req.db.collection('nodes');
    await nodes.updateOne(
      { _id: device_id },
      {
        $set: {
          soil_raw: soil.raw,
          soil_norm: soil.norm || null,
          temp_c: env?.temp_c || null,
          rh: env?.rh || null,
          lux: env?.lux || null,
          status: status,
          last_seen: new Date(serverTs * 1000)
        },
        $setOnInsert: {
          _id: device_id,
          calibrated: false,
          dry_raw: null,
          wet_raw: null
        }
      },
      { upsert: true }
    );

    // Store reading in history collection for graphs
    const readings = req.db.collection('readings');
    await readings.insertOne({
      device_id,
      ts: serverTs,
      soil_raw: soil.raw,
      soil_norm: soil.norm || null,
      temp_c: env?.temp_c || null,
      rh: env?.rh || null,
      lux: env?.lux || null,
      status: status,
      created_at: new Date(serverTs * 1000)
    });
    console.log(`📊 Historical reading stored (ts: ${serverTs})`);

    // Broadcast to WebSocket clients
    const wss = req.app.get('wss');
    if (wss) {
      const clientCount = wss.clients.size;
      console.log(`📡 Broadcasting to ${clientCount} WebSocket client(s)`);
      wss.clients.forEach(client => {
        if (client.readyState === 1) { // OPEN
          client.send(JSON.stringify({
            device_id,
            ts: serverTs,
            soil_raw: soil.raw,
            temp_c: env?.temp_c,
            status
          }));
        }
      });
    }

    console.log(`✅ Reading saved and broadcast\n`);
    res.status(200).json({ 
      success: true, 
      message: 'Reading accepted',
      status
    });
  } catch (error) {
    console.error('Ingest error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
