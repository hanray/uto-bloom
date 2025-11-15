import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isTVMode, setIsTVMode] = useState(false);

  useEffect(() => {
    // Check if TV mode
    const urlParams = new URLSearchParams(window.location.search);
    const tvMode = urlParams.get('tv') === '1';
    
    setIsTVMode(tvMode);

    // TV Mode: Snap cursor to focused element
    if (tvMode) {
      const handleFocusChange = () => {
        const focused = document.activeElement;
        if (focused && focused !== document.body) {
          const rect = focused.getBoundingClientRect();
          setMousePosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          });
          setIsVisible(true);
        }
      };

      // Listen for focus changes
      document.addEventListener('focusin', handleFocusChange);
      // Initial focus
      handleFocusChange();

      return () => {
        document.removeEventListener('focusin', handleFocusChange);
      };
    }

    // Desktop/Mobile: Follow mouse normally
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', updateMousePosition);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  // Don't render if not visible
  if (!isVisible) return null;

  // TV mode gets snappier cursor, desktop/mobile gets smooth following
  const springConfig = isTVMode
    ? { type: 'spring', stiffness: 800, damping: 35, mass: 0.3 }
    : { type: 'spring', stiffness: 500, damping: 28, mass: 0.5 };

  return (
    <>
      {/* Main cursor with glass effect */}
      <motion.div
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 9999,
          width: '40px',
          height: '40px',
        }}
        animate={{
          x: mousePosition.x - 20,
          y: mousePosition.y - 20,
        }}
        transition={springConfig}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {/* Glass blur circle */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px 0 rgba(139, 92, 246, 0.37)',
            }}
          />

          {/* Animated gradient blob */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              opacity: 0.6,
              background:
                'radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.8), rgba(236, 72, 153, 0.6), rgba(91, 127, 219, 0.7))',
              filter: 'blur(8px)',
            }}
            animate={{
              background: [
                'radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.8), rgba(236, 72, 153, 0.6), rgba(91, 127, 219, 0.7))',
                'radial-gradient(circle at 70% 70%, rgba(236, 72, 153, 0.8), rgba(91, 127, 219, 0.6), rgba(139, 92, 246, 0.7))',
                'radial-gradient(circle at 50% 80%, rgba(91, 127, 219, 0.8), rgba(139, 92, 246, 0.6), rgba(236, 72, 153, 0.7))',
                'radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.8), rgba(236, 72, 153, 0.6), rgba(91, 127, 219, 0.7))',
              ],
              scale: [1, 1.2, 0.9, 1],
              rotate: [0, 90, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Inner glow */}
          <motion.div
            style={{
              position: 'absolute',
              inset: '8px',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Center white dot */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
            }}
          />
        </div>
      </motion.div>
    </>
  );
}
