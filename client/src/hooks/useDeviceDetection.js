import { useState, useEffect } from 'react';

/**
 * Detect device type for layout selection
 * 
 * @returns {Object} Device detection state
 * @property {boolean} isTVMode - Explicitly enabled via ?tv=1 URL param
 * @property {boolean} isMobile - Mobile device (touch + small screen) or ?mobile=1 URL param
 * @property {boolean} isDesktop - Desktop/laptop (default)
 */
export function useDeviceDetection() {
  const [deviceType, setDeviceType] = useState(() => {
    // Initial detection (SSR-safe)
    if (typeof window === 'undefined') {
      return { isTVMode: false, isMobile: false, isDesktop: true };
    }
    
    const params = new URLSearchParams(window.location.search);
    const isTVMode = params.get('tv') === '1';
    const forceMobile = params.get('mobile') === '1';
    const isMobile = forceMobile || (window.innerWidth <= 844 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
    const isDesktop = !isTVMode && !isMobile;
    
    return { isTVMode, isMobile, isDesktop };
  });

  useEffect(() => {
    // Re-detect on resize (for responsive testing)
    const handleResize = () => {
      const params = new URLSearchParams(window.location.search);
      const isTVMode = params.get('tv') === '1';
      const forceMobile = params.get('mobile') === '1';
      const isMobile = forceMobile || (window.innerWidth <= 844 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
      const isDesktop = !isTVMode && !isMobile;
      
      setDeviceType({ isTVMode, isMobile, isDesktop });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceType;
}
