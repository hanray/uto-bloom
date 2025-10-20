// REQ: BR-FW-001 (Take reading on regular schedule)
// REQ: FR-FW-002 (Configurable reading schedule with sensible default)

// Uto Bloom Firmware - Sampling Module
// Handles scheduled sensor readings

// Default sampling interval: 15 minutes (900000 ms)
const unsigned long SAMPLING_INTERVAL = 15 * 60 * 1000;
unsigned long lastSampleTime = 0;

/**
 * Initialize sampling module
 */
void initSampling() {
  // TODO: Load sampling interval from config
  // TODO: Set up timer interrupt if needed
  // TODO: Initialize sample counter
  
  Serial.println("Sampling module initialized (stub)");
}

/**
 * Check if it's time to take a reading
 */
bool shouldSample() {
  unsigned long currentTime = millis();
  
  // TODO: Handle millis() rollover (after ~49 days)
  // TODO: Apply jitter to avoid exact timing collisions
  
  if (currentTime - lastSampleTime >= SAMPLING_INTERVAL) {
    lastSampleTime = currentTime;
    return true;
  }
  
  return false;
}

/**
 * Configure custom sampling interval
 * @param minutes - Interval in minutes (1-60)
 */
void setSamplingInterval(int minutes) {
  // TODO: Validate range (1-60 minutes)
  // TODO: Save to EEPROM/Flash
  // TODO: Apply new interval
  
  Serial.print("Sampling interval set to: ");
  Serial.print(minutes);
  Serial.println(" minutes (stub)");
}
