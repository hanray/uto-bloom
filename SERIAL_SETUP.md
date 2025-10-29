# Uto Bloom - Serial Prototype Setup

## Hardware Testing via Serial Port

Since you're working with a prototype connected via USB/Serial, here's how to get data from your Arduino/ESP32 into the system.

## Quick Start

### 1. Find Your Serial Port

```bash
npm run serial:list
```

This will show available COM ports (Windows) or /dev/tty* (Mac/Linux)

### 2. Upload Firmware to Arduino

1. Open Arduino IDE
2. Load `firmware/prototype-serial-test.ino`
3. Configure pins:
   - `POWER_PIN = 12` - Controls power to soil sensor
   - `SENSOR_PIN = A0` - Reads analog value
4. Upload to your board

### 3. Start the Server

```bash
npm start
```

Server runs on http://localhost:3000

### 4. Start the Serial Bridge

```bash
# Windows
npm run serial COM3

# Mac/Linux
npm run serial /dev/ttyUSB0
```

Replace `COM3` with your actual port from step 1.

### 5. Open the Web App

```bash
cd client
npm run dev
```

App runs on http://localhost:5173

## Data Flow

```
Arduino → Serial Port → Serial Bridge → Express API → MongoDB → PWA
```

## Expected Serial Output

The Arduino should output JSON like this every 15 seconds:

```json
{"device_id":"pot-01","ts":1234567890,"soil":{"raw":612},"env":{"temp_c":22.5}}
```

## Manual Testing

Send a test reading without hardware:

```bash
# Send soil reading of 300 (dry)
node scripts/test-reading.js 300

# Send soil reading of 600 with 25°C temp
node scripts/test-reading.js 600 25
```

## Status Thresholds (per BRD)

- **Need water**: raw < 250
- **I'm doing fine**: 250 ≤ raw < 450
- **I'm doing great**: 450 ≤ raw < 800
- **Over-wet**: raw ≥ 850

## Troubleshooting

### Serial Bridge Won't Connect

1. Check the COM port with `npm run serial:list`
2. Make sure Arduino IDE Serial Monitor is CLOSED
3. Check baud rate matches (9600 in firmware and bridge)

### No Data Appearing

1. Open Arduino IDE Serial Monitor to verify JSON output
2. Check that lines end with newline (`Serial.println`)
3. Verify JSON format is valid

### API Errors

1. Make sure server is running (`npm start`)
2. Check server logs for errors
3. Verify MongoDB connection in `.env`

## Sensor Wiring

**SparkFun Soil Moisture Sensor (Resistive)**

```
Sensor VCC → Arduino Pin 12 (POWER_PIN)
Sensor GND → Arduino GND
Sensor SIG → Arduino A0 (SENSOR_PIN)
```

Optional: 100kΩ resistor from SIG to GND (reduces noise)

## Next Steps

Once you verify the serial workflow works:

1. Test different moisture levels (dry pot, wet pot)
2. Verify status changes in the web app
3. Check 24h history chart updates
4. Later: migrate to Wi-Fi firmware for wireless operation

---

**Note**: The serial bridge is for **prototype testing only**. Production uses Wi-Fi firmware that POSTs directly to the API.
