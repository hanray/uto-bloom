// REQ: Server entry point for all API endpoints
// Main Express server for Uto Bloom

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Start server function
async function startServer() {
  try {
    // Connect to MongoDB FIRST
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('uto_bloom');
    console.log('✅ Connected to MongoDB');
    
    // Make db available to routes
    app.use((req, res, next) => {
      req.db = db;
      next();
    });

// Routes
const ingestRouter = require('./src/routes/ingest');
const historyRouter = require('./src/routes/history');
const nodesRouter = require('./src/routes/nodes');

app.use('/api', ingestRouter);
app.use('/api', historyRouter);
app.use('/api', nodesRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Uto Bloom server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Uto Bloom API Server',
    version: '1.0.0',
    endpoints: [
      'POST /api/ingest',
      'GET /api/history',
      'GET /api/nodes/:id',
      'GET /health',
      'POST /api/test/seed - Seed test data'
    ]
  });
});

// Test endpoint to seed initial data
app.post('/api/test/seed', async (req, res) => {
  try {
    const nodes = req.db.collection('nodes');
    await nodes.updateOne(
      { _id: 'pot-01' },
      {
        $set: {
          soil_raw: 550,
          soil_norm: 0.55,
          temp_c: 22,
          rh: 45,
          lux: 800,
          status: 'great',
          last_seen: new Date(),
          calibrated: false,
          dry_raw: null,
          wet_raw: null
        }
      },
      { upsert: true }
    );
    
    res.json({ 
      success: true, 
      message: 'Test data seeded for pot-01' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// WebSocket setup (must be done BEFORE server starts)
const { setupLiveStream } = require('./src/routes/live');

// Start server - bind to 0.0.0.0 to accept connections from all network interfaces
const HOST = '0.0.0.0'; // Allows connections from TV on same WiFi
const server = app.listen(PORT, HOST, () => {
  console.log(`🌱 Uto Bloom server running on ${HOST}:${PORT}`);
  console.log(`📡 Local access: http://localhost:${PORT}/health`);
  console.log(`📺 TV access: http://10.88.111.7:${PORT}/health`);
  console.log(`📚 API docs: http://10.88.111.7:${PORT}/`);
});

// Attach WebSocket to server
const wss = setupLiveStream(server);
app.set('wss', wss);
console.log(`🔴 WebSocket server ready`);
console.log(`   Local: ws://localhost:${PORT}/live`);
console.log(`   TV: ws://10.88.111.7:${PORT}/live`);

  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
