// REQ: BR-FW-003 (Support optional Dry/Wet calibration)
// REQ: FR-FW-005 (Support optional calibration steps stored per pot)

// Uto Bloom Firmware - Calibration Module
// Handles two-step Dry/Wet calibration for personalized thresholds

#include <EEPROM.h>

const int EEPROM_CALIBRATED_FLAG = 0;
const int EEPROM_DRY_VALUE = 1;
const int EEPROM_WET_VALUE = 3;

struct Calibration {
  bool isCalibrated;
  int dryValue;
  int wetValue;
};

Calibration calibration;

/**
 * Initialize calibration module
 */
void initCalibration() {
  loadCalibration();
  
  if (calibration.isCalibrated) {
    Serial.println("Device is calibrated");
    Serial.print("  Dry: ");
    Serial.println(calibration.dryValue);
    Serial.print("  Wet: ");
    Serial.println(calibration.wetValue);
  } else {
    Serial.println("Device not calibrated - using defaults");
  }
}

/**
 * Load calibration from EEPROM/Flash
 */
void loadCalibration() {
  // TODO: Read from EEPROM
  // TODO: Validate stored values
  
  calibration.isCalibrated = false;
  calibration.dryValue = 250;   // Default
  calibration.wetValue = 800;   // Default
}

/**
 * Save Dry calibration point
 */
void calibrateDry(int reading) {
  calibration.dryValue = reading;
  
  // TODO: Save to EEPROM
  // TODO: Mark as partially calibrated
  
  Serial.print("Dry calibration saved: ");
  Serial.println(reading);
}

/**
 * Save Wet calibration point
 */
void calibrateWet(int reading) {
  calibration.wetValue = reading;
  calibration.isCalibrated = true;
  
  // TODO: Save to EEPROM
  // TODO: Mark as fully calibrated
  // TODO: Send calibration update to server
  
  Serial.print("Wet calibration saved: ");
  Serial.println(reading);
  Serial.println("Calibration complete!");
}

/**
 * Reset calibration to defaults
 */
void resetCalibration() {
  calibration.isCalibrated = false;
  calibration.dryValue = 250;
  calibration.wetValue = 800;
  
  // TODO: Clear EEPROM
  // TODO: Notify server
  
  Serial.println("Calibration reset to defaults");
}

/**
 * Normalize raw reading using calibration (0.0 to 1.0)
 */
float normalizeReading(int raw) {
  if (!calibration.isCalibrated) {
    return -1.0;  // Not calibrated
  }
  
  // TODO: Implement linear mapping
  // TODO: Clamp to 0.0-1.0 range
  
  return 0.0;  // Stub
}
