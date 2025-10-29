import chroma from 'chroma-js';

/**
 * Health-to-Color Mapping using Perceptually Uniform LCH Color Space
 * ARTISTIC MODE: Neon/UV-inspired palette
 * As specified in PLANT_VISUALIZATION_PLAN.md
 */

// Color states based on moisture levels (NEON PALETTE)
const NEON_COLORS = {
  CRITICAL: '#FF6B35',    // Neon orange/red - danger glow
  STRESSED: '#F7FF58',    // Electric yellow - warning
  OPTIMAL: '#39FF14',     // Terminal green - healthy vibrant
  OVERWATERED: '#00D9FF'  // Cyan/electric blue - cool tone
};

// Create bezier interpolation scale in LCH color space
const colorScale = chroma.bezier([
  NEON_COLORS.CRITICAL,
  NEON_COLORS.STRESSED,
  NEON_COLORS.OPTIMAL,
  NEON_COLORS.OVERWATERED
]).scale().mode('lch');

/**
 * Calculate moisture score (0-1) from raw reading
 * @param {number} moisture - Raw moisture reading (0-1023 typically)
 * @param {object} thresholds - Species-specific thresholds
 * @returns {number} Normalized score 0-1
 */
export function calculateMoistureScore(moisture, thresholds = {}) {
  const {
    critical = 200,
    optimal = 350
  } = thresholds;
  
  // Clamp to 0-1 range
  const score = Math.max(0, Math.min(1, 
    (moisture - critical) / (optimal - critical)
  ));
  
  return score;
}

/**
 * Get health color based on moisture reading
 * @param {number} moisture - Raw moisture reading
 * @param {object} thresholds - Species-specific thresholds
 * @returns {string} Hex color string
 */
export function getMoistureColor(moisture, thresholds = {}) {
  const score = calculateMoistureScore(moisture, thresholds);
  return colorScale(score).hex();
}

/**
 * Get THREE.Color object for use in materials
 * @param {number} moisture - Raw moisture reading
 * @param {object} thresholds - Species-specific thresholds
 * @returns {THREE.Color} Three.js Color object
 */
export function getMoistureColorThree(moisture, thresholds = {}) {
  const score = calculateMoistureScore(moisture, thresholds);
  const hexColor = colorScale(score).hex();
  
  // Return object that THREE.Color can parse
  return hexColor;
}

export default {
  calculateMoistureScore,
  getMoistureColor,
  getMoistureColorThree,
  NEON_COLORS
};
