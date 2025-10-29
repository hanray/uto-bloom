// REQ: BR-FW-004 (Receive JSON payload from serial device)
// Serial Port Bridge - Reads sensor data from Arduino/ESP32 via USB

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// Configuration
const SERIAL_PORT = process.argv[2] || 'COM3'; // Pass port as argument or default to COM3
const BAUD_RATE = 9600;
const API_URL = 'http://localhost:3000/api/ingest';

console.log('🔌 Uto Bloom Serial Bridge');
console.log(`📡 Listening on ${SERIAL_PORT} @ ${BAUD_RATE} baud`);
console.log(`🌐 Posting to ${API_URL}\n`);

// Open serial port
const port = new SerialPort({
  path: SERIAL_PORT,
  baudRate: BAUD_RATE,
  autoOpen: false
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Handle serial port open
port.open((err) => {
  if (err) {
    console.error('❌ Error opening serial port:', err.message);
    console.log('\n💡 Available ports:');
    SerialPort.list().then(ports => {
      ports.forEach(p => {
        console.log(`   - ${p.path}${p.manufacturer ? ` (${p.manufacturer})` : ''}`);
      });
      console.log('\n📝 Usage: node scripts/serial-bridge.js COM3');
    });
    process.exit(1);
  }
  console.log('✅ Serial port opened successfully\n');
});

// Parse incoming data
parser.on('data', async (line) => {
  const trimmed = line.trim();
  
  // Ignore empty lines or debug output
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('DEBUG')) {
    return;
  }
  
  console.log('📥 Received:', trimmed);
  
  try {
    // Try to parse as JSON
    const data = JSON.parse(trimmed);
    
    // Validate expected format
    if (!data.device_id || !data.ts || !data.soil) {
      console.log('⚠️  Invalid format - expected {device_id, ts, soil: {raw}}');
      return;
    }
    
    console.log(`   Device: ${data.device_id}`);
    console.log(`   Soil: ${data.soil.raw} (${data.soil.norm || 'uncalibrated'})`);
    if (data.env?.temp_c) console.log(`   Temp: ${data.env.temp_c}°C`);
    
    // Post to API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Posted successfully - Status: ${result.status}\n`);
    } else {
      console.log(`❌ API error: ${result.error}\n`);
    }
    
  } catch (error) {
    // Not JSON - might be debug output from Arduino
    if (trimmed.length > 0) {
      console.log(`   (Debug output - not JSON)\n`);
    }
  }
});

// Handle errors
port.on('error', (err) => {
  console.error('❌ Serial port error:', err.message);
  console.log('Attempting to reconnect in 5 seconds...');
  setTimeout(() => {
    console.log('Reconnecting...');
    port.close(() => {
      setTimeout(() => process.exit(1), 1000); // Exit to allow restart
    });
  }, 5000);
});

port.on('close', () => {
  console.log('\n🔌 Serial port closed');
  process.exit(0);
});

// Graceful shutdown with timeout
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  port.close(() => {
    console.log('✅ Port released cleanly');
    process.exit(0);
  });
  
  // Force exit after 2 seconds if port won't close
  setTimeout(() => {
    console.log('⚠️  Force closing...');
    process.exit(0);
  }, 2000);
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught error:', err.message);
  port.close(() => process.exit(1));
});

process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled rejection:', err.message);
  port.close(() => process.exit(1));
});

console.log('⏳ Waiting for data from device...\n');
console.log('Expected JSON format:');
console.log(JSON.stringify({
  device_id: "pot-01",
  ts: Math.floor(Date.now() / 1000),
  soil: { raw: 612, norm: 0.42 },
  env: { temp_c: 23.6 }
}, null, 2));
console.log('\n' + '─'.repeat(60) + '\n');
