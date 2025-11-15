# UtoVision API Service

Mock AI-powered plant vision analysis API for UtoBloom.

## Quick Start

### Windows PowerShell (Recommended)

**Start server:**
```powershell
.\start-server.ps1
```

**Stop server:**
```powershell
.\stop-server.ps1
```

**Quick test (starts server + runs test):**
```powershell
cd ..
.\quick-test.ps1
```

### Manual Start

```bash
# Install dependencies
npm install

# Start server
npm start

# Or with auto-reload
npm run dev
```

Server runs on http://localhost:3001

## Endpoints

### POST /api/analyze/plant
Analyze plant health with camera image and sensor data.

**Headers:**
```
Authorization: Bearer sk_dev_utobloom_2025
Content-Type: application/json
```

**Request:**
```json
{
  "frames": ["base64-encoded-image-data"],
  "question": "Does my plant look healthy and well today?",
  "context": {
    "plant_id": "pot-01",
    "species": "monstera",
    "current_moisture": 0.45,
    "temperature_c": 22.5,
    "humidity_percent": 47,
    "light_lux": 12000,
    "last_watered": "2025-11-14T08:00:00Z",
    "health_status": "great"
  },
  "options": {
    "include_care_recommendations": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-11-15T01:30:00.000Z",
  "health_assessment": {
    "overall_health": "Great",
    "confidence": 0.85,
    "visual_symptoms": [],
    "diagnosis": {
      "primary_issue": null,
      "confidence": 0.85
    }
  },
  "care_recommendations": [
    {
      "action": "Maintain current care",
      "priority": "low",
      "details": "Plant is thriving!",
      "estimated_recovery_time": "N/A"
    }
  ],
  "metadata": {
    "model_used": "sensor-fusion-v1",
    "processing_time_ms": 2340,
    "sensor_data_used": true
  }
}
```

### GET /api/status
Check service health.

**Response:**
```json
{
  "success": true,
  "service": {
    "status": "operational",
    "uptime_seconds": 3600,
    "version": "1.0.0"
  }
}
```

## Analysis Logic

The mock API analyzes plant health based on sensor readings:

- **Moisture < 25%**: Critical - Needs Water
- **Moisture 25-35%**: Fair - Water soon
- **Moisture 35-75%**: Great - Optimal
- **Moisture 75-85%**: Good - Slightly moist
- **Moisture > 85%**: At Risk - Overwatered

- **Temp < 15°C**: Too cold
- **Temp 15-30°C**: Optimal
- **Temp > 30°C**: Too hot

- **Light < 5000 lux**: Low light
- **Light 10,000-20,000 lux**: Optimal

## Integration with UtoBloom

The UtoBloom client calls this API when the AI Assistant tile is activated with camera access.

## Troubleshooting

See `../DEVELOPMENT_TIPS.md` for detailed troubleshooting and common issues.

**Quick fixes:**
- Port in use: `.\stop-server.ps1`
- Server exits: Use `.\start-server.ps1` (opens persistent window)
- Test fails: Run `cd .. ; .\quick-test.ps1`

## Documentation

- Full API Specification: `../UTOVISION_API_SPEC.md`
- Development Guide: `../DEVELOPMENT_TIPS.md`
