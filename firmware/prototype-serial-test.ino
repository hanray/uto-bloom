// REQ: BR-FW-001, BR-FW-002, BR-FW-004 (Sampling, power management, JSON payload)
// Uto Bloom Prototype - Serial Test Firmware
// Reads soil moisture sensor and sends JSON over serial

const int POWER_PIN = 7;   // GPIO pin controlling probe power
const int SENSOR_PIN = A0;  // Analog pin for reading
const int SAMPLE_INTERVAL = 15000; // 15 seconds for testing (change to 900000 for 15 min)

unsigned long lastSampleTime = 0;
const char* DEVICE_ID = "pot-01";

void setup() {
  Serial.begin(9600);
  pinMode(POWER_PIN, OUTPUT);
  digitalWrite(POWER_PIN, LOW); // Probe starts OFF
  
  delay(2000); // Wait for serial to be ready
  Serial.println("# Uto Bloom Prototype - Serial Test");
  Serial.println("# Sending JSON payloads every 15 seconds");
  Serial.println("# Format: {device_id, ts, soil:{raw}, env:{temp_c}}");
  Serial.println();
}

void loop() {
  unsigned long currentTime = millis();
  
  // Check if it's time to sample
  if (currentTime - lastSampleTime >= SAMPLE_INTERVAL) {
    lastSampleTime = currentTime;
    
    // Take a reading
    int soilRaw = takePoweredReading();
    
    // PROTOTYPE: Use fake recent timestamp for testing
    // In production with RTC/NTP, use real Unix timestamp
    // Oct 20, 2025 00:00:00 UTC = 1761004800
    unsigned long timestamp = 1761004800UL + (currentTime / 1000);
    
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
 * Power on probe, take stable reading, power off
 * Per BRD: duty-cycle power management
 */
int takePoweredReading() {
  // Power ON
  digitalWrite(POWER_PIN, HIGH);
  delay(150); // Settle time
  
  // Take 3 samples and return median
  int samples[3];
  for (int i = 0; i < 3; i++) {
    samples[i] = analogRead(SENSOR_PIN);
    delay(10);
  }
  
  // Power OFF
  digitalWrite(POWER_PIN, LOW);
  
  // Simple median (sort and take middle)
  if (samples[0] > samples[1]) { int t = samples[0]; samples[0] = samples[1]; samples[1] = t; }
  if (samples[1] > samples[2]) { int t = samples[1]; samples[1] = samples[2]; samples[2] = t; }
  if (samples[0] > samples[1]) { int t = samples[0]; samples[0] = samples[1]; samples[1] = t; }
  
  return samples[1]; // Return median
}
