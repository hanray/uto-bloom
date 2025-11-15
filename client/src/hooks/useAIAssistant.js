import { useState, useEffect, useRef, useCallback } from 'react';
import utoVisionAPI from '../utils/utoVisionAPI';

/**
 * Hook for managing AI Assistant state and camera
 * @param {Object} plantData - Current plant data and sensor readings
 * @param {string} platform - Platform type: 'desktop', 'mobile', or 'tv'
 */
export function useAIAssistant(plantData, platform = 'desktop') {
  const [aiStatus, setAiStatus] = useState('idle'); // idle, connecting, active, error
  const [hasCamera, setHasCamera] = useState(null);
  const [responses, setResponses] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  // Check for camera on mount (skip for TV)
  useEffect(() => {
    if (platform === 'tv') {
      console.log('📺 TV platform detected - no camera check');
      setHasCamera(false); // TV doesn't have camera
    } else {
      console.log(`📱 ${platform} platform - checking for camera`);
      utoVisionAPI.hasCamera().then((result) => {
        console.log(`📷 Camera available: ${result}`);
        setHasCamera(result);
      });
    }
  }, [platform]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        utoVisionAPI.stopCamera();
      }
    };
  }, [stream]);

  const startAI = useCallback(async () => {
    console.log(`🚀 Starting AI Assistant (platform: ${platform})`);
    
    // TV platform - always show QR code
    if (platform === 'tv') {
      console.log('📺 TV detected - showing QR code');
      setShowQR(true);
      setAiStatus('idle');
      addResponse({
        type: 'info',
        message: '📱 Scan QR code with your mobile device to activate AI analysis',
        timestamp: Date.now()
      });
      return;
    }

    // Desktop/Mobile - check camera availability
    if (!hasCamera) {
      console.log('❌ No camera available - showing QR code');
      setShowQR(true);
      addResponse({
        type: 'info',
        message: 'No camera detected. Scan QR code to use your mobile device.',
        timestamp: Date.now()
      });
      return;
    }

    console.log('📷 Camera available - requesting access');
    setAiStatus('connecting');
    
    try {
      // Request camera access
      console.log('🔐 Requesting camera permission...');
      const mediaStream = await utoVisionAPI.requestCameraAccess();
      console.log('✅ Camera permission granted');
      setStream(mediaStream);

      // Attach to video element
      if (videoRef.current) {
        console.log('🎬 Attaching camera stream to video element');
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        console.log('▶️ Video playback started');
      }

      setAiStatus('active');
      console.log('✅ AI Assistant active');

      // Start continuous analysis
      const plantContext = {
        plant_id: 'pot-01',
        species: plantData?.plant?.species_key || 'monstera',
        moisture: plantData?.lastReading?.moisture_level,
        temperature: plantData?.lastReading?.temperature,
        humidity: plantData?.lastReading?.humidity,
        light: plantData?.lastReading?.light_lux,
        lastWatered: plantData?.plant?.last_watered,
        healthStatus: plantData?.status
      };

      console.log('🔄 Starting continuous analysis every 30s');
      console.log('   Plant context:', plantContext);

      utoVisionAPI.startContinuousAnalysis(
        videoRef.current,
        plantContext,
        handleAnalysisResult,
        handleAnalysisError
      );

    } catch (error) {
      console.error('❌ Failed to start AI:', error);
      setAiStatus('error');
      addResponse({
        type: 'error',
        message: 'Failed to access camera. Please check permissions.',
        timestamp: Date.now()
      });
    }
  }, [hasCamera, plantData]);

  const stopAI = useCallback(() => {
    utoVisionAPI.stopCamera();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setAiStatus('idle');
  }, [stream]);

  const addResponse = useCallback((response) => {
    setResponses(prev => {
      const updated = [{ ...response, id: Date.now() + Math.random() }, ...prev];
      return updated.slice(0, 10); // Keep only last 10
    });
  }, []);

  const handleAnalysisResult = useCallback((result) => {
    // Extract meaningful response from real API
    const healthAssessment = result.health_assessment;
    const recommendations = result.care_recommendations;

    if (healthAssessment) {
      addResponse({
        type: 'health',
        message: `Health: ${healthAssessment.overall_health}. ${
          healthAssessment.diagnosis?.primary_issue 
            ? `Detected: ${healthAssessment.diagnosis.primary_issue}` 
            : 'Plant looks healthy!'
        }`,
        confidence: healthAssessment.confidence,
        timestamp: Date.now()
      });
    }

    if (recommendations && recommendations.length > 0) {
      const topRec = recommendations[0];
      addResponse({
        type: 'analysis',
        message: `💡 ${topRec.action}: ${topRec.details}`,
        timestamp: Date.now()
      });
    }
  }, [addResponse]);

  const handleAnalysisError = useCallback((error) => {
    addResponse({
      type: 'error',
      message: `Analysis failed: ${error.message}`,
      timestamp: Date.now()
    });
  }, [addResponse]);

  const clearResponses = useCallback(() => {
    setResponses([]);
  }, []);

  const toggleQR = useCallback(() => {
    setShowQR(prev => !prev);
  }, []);

  return {
    aiStatus,
    hasCamera,
    responses,
    showQR,
    videoRef,
    startAI,
    stopAI,
    toggleQR,
    clearResponses
  };
}
