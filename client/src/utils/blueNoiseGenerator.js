import * as THREE from 'three';

/**
 * Generate a simple blue-noise-like texture procedurally
 * (For production, replace with a proper blue-noise tileable texture)
 * 
 * This uses a dithered random pattern as a placeholder
 */
export function generateBlueNoiseTexture(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;
  
  // Simple dithered noise (not true blue-noise, but usable placeholder)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      
      // Use a hash-like function for pseudo-random but deterministic pattern
      const hash = (x * 374761393 + y * 668265263) % 2147483647;
      const value = (hash / 2147483647) * 255;
      
      // Add Bayer-like dither for better distribution
      const bayerX = x % 4;
      const bayerY = y % 4;
      const bayerMatrix = [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5]
      ];
      const dither = bayerMatrix[bayerY][bayerX] / 16.0;
      
      const finalValue = Math.floor(value * 0.7 + dither * 0.3 * 255);
      
      data[i] = finalValue;     // R
      data[i + 1] = finalValue; // G
      data[i + 2] = finalValue; // B
      data[i + 3] = 255;        // A
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  // Create Three.js texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  
  return texture;
}

export default generateBlueNoiseTexture;
