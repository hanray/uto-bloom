// REQ: BR-FW-004 (Send small, well-formed JSON payload)
// REQ: FR-FW-003 (Post compact JSON with device_id, timestamp, soil, env)

// Uto Bloom Firmware - HTTP Client Module
// Handles POST requests to server with JSON payloads

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* SERVER_URL = "https://your-server.com/ingest";
const char* DEVICE_KEY = "your-device-key-here";
const char* DEVICE_ID = "pot-01";

/**
 * Initialize HTTP client
 */
void initHTTPClient() {
  // TODO: Load server URL from config
  // TODO: Load device key from secure storage
  // TODO: Validate WiFi connection
  
  Serial.println("HTTP client initialized (stub)");
}

/**
 * Build JSON payload from sensor reading
 */
String buildPayload(int soilRaw, float soilNorm, float tempC) {
  StaticJsonDocument<256> doc;
  
  doc["device_id"] = DEVICE_ID;
  doc["ts"] = getTimestamp();
  
  // Soil reading
  JsonObject soil = doc.createNestedObject("soil");
  soil["raw"] = soilRaw;
  if (soilNorm >= 0.0) {
    soil["norm"] = soilNorm;
  }
  
  // Environmental data (optional)
  JsonObject env = doc.createNestedObject("env");
  if (!isnan(tempC)) {
    env["temp_c"] = tempC;
  }
  // TODO: Add RH (relative humidity) if available
  // TODO: Add lux (light) if available
  
  String payload;
  serializeJson(doc, payload);
  
  return payload;
}

/**
 * POST reading to server
 */
bool postReading(String payload) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected - buffering reading");
    return false;
  }
  
  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + String(DEVICE_KEY));
  
  // TODO: Implement timeout
  // TODO: Handle HTTP errors
  // TODO: Retry logic for transient failures
  
  int httpCode = http.POST(payload);
  
  if (httpCode > 0) {
    Serial.print("HTTP Response: ");
    Serial.println(httpCode);
    
    if (httpCode == 200) {
      return true;
    }
  } else {
    Serial.print("HTTP Error: ");
    Serial.println(http.errorToString(httpCode));
  }
  
  http.end();
  return false;
}

/**
 * Get current Unix timestamp
 */
unsigned long getTimestamp() {
  // TODO: Implement NTP time sync
  // TODO: Handle offline timestamp estimation
  
  return 0;  // Stub
}
