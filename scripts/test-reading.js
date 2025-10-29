// Manual test tool to send readings to API
// Usage: node scripts/test-reading.js <soil_raw> [temp_c]

const DEVICE_ID = 'pot-01';
const API_URL = 'http://localhost:3000/api/ingest';

const soilRaw = parseInt(process.argv[2]) || 500;
const tempC = parseFloat(process.argv[3]) || 22.0;

const payload = {
  device_id: DEVICE_ID,
  ts: Math.floor(Date.now() / 1000),
  soil: {
    raw: soilRaw
  },
  env: {
    temp_c: tempC
  }
};

console.log('📤 Sending test reading...');
console.log(JSON.stringify(payload, null, 2));

fetch(API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
  .then(res => res.json())
  .then(data => {
    console.log('\n✅ Response:', data);
    console.log(`\nStatus computed: ${data.status}`);
  })
  .catch(err => {
    console.error('\n❌ Error:', err.message);
  });
