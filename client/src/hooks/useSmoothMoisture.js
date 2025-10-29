import { useState, useEffect, useRef } from 'react';

/**
 * useSmoothMoisture - Smooths noisy sensor data with rolling average + debouncing
 * 
 * Problem: Sensor readings can be noisy (343 → 339 → 344 → 341) creating jittery animations
 * Solution: Rolling average window + debouncing
 * 
 * @param {number} rawMoisture - Raw moisture sensor reading
 * @param {number} windowSize - Size of rolling average window (default: 10)
 * @param {number} debounceMs - Debounce delay in milliseconds (default: 500)
 * @returns {number} Smoothed moisture value
 */
export function useSmoothMoisture(rawMoisture, windowSize = 10, debounceMs = 500) {
  const [smoothed, setSmoothed] = useState(rawMoisture);
  const bufferRef = useRef([]);
  
  useEffect(() => {
    // Add to rolling window
    bufferRef.current.push(rawMoisture);
    if (bufferRef.current.length > windowSize) {
      bufferRef.current.shift();
    }
    
    // Calculate average
    const avg = bufferRef.current.reduce((a, b) => a + b, 0) / bufferRef.current.length;
    
    // Debounce updates (only update if 5+ point difference)
    if (Math.abs(avg - smoothed) > 5) {
      const timer = setTimeout(() => setSmoothed(avg), debounceMs);
      return () => clearTimeout(timer);
    }
  }, [rawMoisture, smoothed, windowSize, debounceMs]);
  
  return smoothed;
}

export default useSmoothMoisture;
