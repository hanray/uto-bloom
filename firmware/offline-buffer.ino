// REQ: FR-FW-004 (Buffer backlog while offline and send upon reconnect)

// Uto Bloom Firmware - Offline Buffer Module
// Stores readings when network is unavailable

#include <EEPROM.h>

const int MAX_BUFFER_SIZE = 20;  // Maximum readings to buffer
const int BUFFER_START_ADDR = 100;  // EEPROM start address

struct BufferedReading {
  unsigned long timestamp;
  int soilRaw;
  float tempC;
  bool valid;
};

BufferedReading buffer[MAX_BUFFER_SIZE];
int bufferCount = 0;

/**
 * Initialize offline buffer
 */
void initOfflineBuffer() {
  // TODO: Load buffer from EEPROM if device restarted
  // TODO: Clear invalid/corrupted entries
  
  bufferCount = 0;
  Serial.println("Offline buffer initialized (stub)");
}

/**
 * Add reading to buffer when offline
 */
bool bufferReading(unsigned long ts, int soilRaw, float tempC) {
  if (bufferCount >= MAX_BUFFER_SIZE) {
    Serial.println("Buffer full - dropping oldest reading");
    // TODO: Implement circular buffer to drop oldest
    return false;
  }
  
  buffer[bufferCount].timestamp = ts;
  buffer[bufferCount].soilRaw = soilRaw;
  buffer[bufferCount].tempC = tempC;
  buffer[bufferCount].valid = true;
  bufferCount++;
  
  // TODO: Persist to EEPROM/Flash
  
  Serial.print("Reading buffered. Buffer count: ");
  Serial.println(bufferCount);
  
  return true;
}

/**
 * Send all buffered readings when connection restored
 */
void flushBuffer() {
  if (bufferCount == 0) {
    return;
  }
  
  Serial.print("Flushing ");
  Serial.print(bufferCount);
  Serial.println(" buffered readings...");
  
  for (int i = 0; i < bufferCount; i++) {
    if (!buffer[i].valid) {
      continue;
    }
    
    // TODO: Build payload for buffered reading
    // TODO: POST to server
    // TODO: Handle failures (keep in buffer)
    // TODO: Mark as sent on success
    
    Serial.print("  Sent reading ");
    Serial.println(i + 1);
  }
  
  // TODO: Clear buffer after successful send
  // TODO: Update EEPROM
  
  bufferCount = 0;
  Serial.println("Buffer flushed (stub)");
}

/**
 * Get buffer status
 */
int getBufferCount() {
  return bufferCount;
}

/**
 * Check if buffer has space
 */
bool hasBufferSpace() {
  return bufferCount < MAX_BUFFER_SIZE;
}
