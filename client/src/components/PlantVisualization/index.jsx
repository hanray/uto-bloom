import { Component, Suspense } from 'react';
import PlantPlaceholder from './PlantPlaceholder';
import PlantCanvas from './PlantCanvas';

// Direct import (removed lazy loading to debug)
console.log('✅ PlantCanvas imported:', PlantCanvas);

// Error boundary to catch any Three.js/WebGL errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 PlantVisualization CRASHED:', {
      error: error,
      message: error?.message,
      stack: error?.stack,
      errorInfo: errorInfo,
      componentStack: errorInfo?.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback to plant emoji with error message
      return (
        <div style={{
          width: '432px',
          height: '432px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
          borderRadius: '1rem',
          padding: '20px',
          gap: '10px'
        }}>
          <div style={{ fontSize: '6rem' }}>🌿</div>
          <div style={{ 
            fontSize: '0.85rem', 
            color: '#ef4444',
            textAlign: 'center',
            fontFamily: 'monospace',
            background: '#fee',
            padding: '10px',
            borderRadius: '8px',
            maxWidth: '90%'
          }}>
            <strong>3D Failed</strong><br/>
            Check console (F12)
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Main PlantVisualization component
 * 
 * @param {number} moisture - Raw moisture sensor reading (0-1023)
 * @param {string} species - Plant species ID (e.g., "pothos", "monstera")
 */
function PlantVisualization({ moisture = 343, species = 'pothos', height }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PlantPlaceholder />}>
        <PlantCanvas moisture={moisture} species={species} height={height} />
      </Suspense>
    </ErrorBoundary>
  );
}

export default PlantVisualization;
