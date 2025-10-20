// REQ: BR-FW-002 (Only power probe briefly during reading)
// REQ: FR-FW-001 (Power probe only during reading, capture stable value)

// Uto Bloom Firmware - Power Management Module
// Implements duty-cycle power control for soil moisture probe

const int POWER_PIN = 12;        // GPIO pin controlling probe power
const int SENSOR_PIN = A0;       // Analog pin for reading
const int POWER_ON_TIME = 150;   // milliseconds to power probe
const int SETTLE_TIME = 120;     // milliseconds for sensor to settle
const int NUM_SAMPLES = 3;       // Take median of N samples

/**
 * Initialize power management
 */
void initPowerManagement() {
  pinMode(POWER_PIN, OUTPUT);
  digitalWrite(POWER_PIN, LOW);  // Probe starts OFF
  
  // TODO: Add optional pulldown resistor (100kΩ) to prevent floating
  
  Serial.println("Power management initialized (stub)");
}

/**
 * Take a powered reading with duty-cycle control
 * Returns median of multiple samples
 */
int takePoweredReading() {
  int samples[NUM_SAMPLES];
  
  // Power ON the probe
  digitalWrite(POWER_PIN, HIGH);
  delay(SETTLE_TIME);  // Wait for sensor to settle
  
  // Take multiple samples
  for (int i = 0; i < NUM_SAMPLES; i++) {
    samples[i] = analogRead(SENSOR_PIN);
    delay(10);  // Small delay between samples
  }
  
  // Power OFF the probe
  digitalWrite(POWER_PIN, LOW);
  
  // TODO: Calculate median to reject outliers
  // TODO: Apply calibration if available
  // TODO: Detect stuck-low (0) or stuck-high (>1020) faults
  
  // Stub: return first sample
  return samples[0];
}

/**
 * Detect sensor faults
 */
bool isSensorFaulty(int reading) {
  // TODO: Track consecutive fault readings (5+ in a row)
  // TODO: Stuck-low: reading == 0
  // TODO: Stuck-high: reading >= 1020
  
  return false;  // Stub
}
