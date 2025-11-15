// REQ: BR-FW-001, BR-FW-002, BR-FW-004 (Sampling, power management, JSON payload)
// Uto Bloom Prototype - Serial Test Firmware
// Reads soil moisture sensor and sends JSON over serial
// Based on SparkFun's proven design - sensor powered via D7 for corrosion prevention

const int POWER_PIN = 7;      // Digital pin controlling sensor power
const int SENSOR_PIN = A1;    // Analog pin for reading
const int SAMPLE_INTERVAL = 30000; // 30 seconds - stable app polling interval

unsigned long lastSampleTime = 0;
const char* DEVICE_ID = "pot-01";

// For stuck detection: track history
int lastMedian = -1;
int identicalCount = 0;

void setup() {
  Serial.begin(9600);
  
  pinMode(POWER_PIN, OUTPUT);       // Set D7 as OUTPUT
  digitalWrite(POWER_PIN, LOW);     // Start with sensor OFF (prevent corrosion)
  
  delay(2000); // Wait for serial to be ready
  Serial.println("# Uto Bloom Prototype - Serial Test");
  Serial.println("# Sensor powered via D7 (duty-cycle for corrosion prevention)");
  Serial.println("# Sending JSON payloads every 30 seconds");
  Serial.println("# Format: {device_id, ts, soil:{raw}, env:{temp_c}}");
  Serial.println();
}

void loop() {
  unsigned long currentTime = millis();
  
  // Check if it's time to sample
  if (currentTime - lastSampleTime >= SAMPLE_INTERVAL) {
    lastSampleTime = currentTime;
    
    // Take a reading
    int soilRaw = takeReading();

    // Use current Unix time as base
    unsigned long timestamp = 1761785884UL + (currentTime / 1000);

  // Build and send JSON
  Serial.print("{\"device_id\":\"");
  Serial.print(DEVICE_ID);
  Serial.print("\",\"ts\":");
  Serial.print(timestamp);
  Serial.print(",\"soil\":{\"raw\":");
  Serial.print(soilRaw);
  Serial.print("},\"env\":{\"temp_c\":");
  Serial.print(22.5); // Mock temperature - replace with actual sensor
  Serial.println("}}");
  }
  
  delay(100); // Small delay to prevent busy-wait
}

/**
 * Power on sensor, take 3 readings, power off
 * Returns median of 3 samples for stability
 * Smarter stuck detection: only warns if samples AND multiple readings over time are identical
 */
int takeReading() {
  digitalWrite(POWER_PIN, HIGH);  // Turn sensor ON
  delay(10);                      // Wait 10ms for sensor to stabilize
  
  // Take 3 samples with small spacing
  int samples[3];
  for (int i = 0; i < 3; i++) {
    samples[i] = analogRead(SENSOR_PIN);
    delay(5); // Tiny delay between samples
  }
  
  digitalWrite(POWER_PIN, LOW);   // Turn sensor OFF
  
  // Debug output - show all 3 samples
  Serial.print("# DEBUG raw samples: [");
  Serial.print(samples[0]);
  Serial.print(", ");
  Serial.print(samples[1]);
  Serial.print(", ");
  Serial.print(samples[2]);
  Serial.print("] ");
  
  // Calculate median (sort and take middle)
  if (samples[0] > samples[1]) { int t = samples[0]; samples[0] = samples[1]; samples[1] = t; }
  if (samples[1] > samples[2]) { int t = samples[1]; samples[1] = samples[2]; samples[2] = t; }
  if (samples[0] > samples[1]) { int t = samples[0]; samples[0] = samples[1]; samples[1] = t; }
  
  int median = samples[1];
  
  // Smarter stuck detection: 
  // Only warn if ALL 3 samples are identical AND we've seen the same exact value 5+ times in a row
  bool samplesIdentical = (samples[0] == samples[1] && samples[1] == samples[2]);
  
  if (median == lastMedian) {
    identicalCount++;
  } else {
    identicalCount = 0; // Reset if value changed
  }
  
  // Warn only if: all samples identical + seen same value 5+ times + not at extremes (0 or 1023)
  if (samplesIdentical && identicalCount >= 5 && median != 0 && median != 1023) {
    Serial.print("⚠️ STUCK (");
    Serial.print(identicalCount);
    Serial.print(" identical readings) ");
  }
  
  // Check for sensor disconnected (all zeros repeatedly)
  if (median == 0 && identicalCount >= 3) {
    Serial.print("⚠️ DISCONNECTED? ");
  }
  
  // Check for variance in samples
  int variance = samples[2] - samples[0]; // Already sorted, so max - min
  if (variance > 50) {
    Serial.print("⚡ NOISY (variance: ");
    Serial.print(variance);
    Serial.print(") ");
  }
  
  Serial.print("→ median: ");
  Serial.println(median);
  
  lastMedian = median; // Store for next comparison
  return median;
}
