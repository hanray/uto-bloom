import { useState, useEffect, useRef, useCallback } from 'react';
import utoVisionAPI from '../utils/utoVisionAPI';

/**
 * Hook for managing AI Assistant state and camera
 * @param {Object} plantData - Current plant data and sensor readings
 * @param {string} platform - Platform type: 'desktop', 'mobile', or 'tv'
 */
export function useAIAssistant(plantData, platform = 'desktop') {
  const [aiStatus, setAiStatus] = useState('initializing'); // initializing, idle, connecting, active, error
  const [hasCamera, setHasCamera] = useState(null);
  const [responses, setResponses] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // NEW: Track when AI is processing
  const [analysisProgress, setAnalysisProgress] = useState(''); // NEW: Show what step AI is on
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const autoCloseTimer = useRef(null);

  // Check for camera on mount (skip for TV)
  useEffect(() => {
    const initialize = async () => {
      if (platform === 'tv') {
        console.log('📺 TV platform detected - no camera check');
        setHasCamera(false); // TV doesn't have camera
        setAiStatus('idle');
      } else {
        console.log(`📱 ${platform} platform - checking for camera`);
        try {
          const result = await utoVisionAPI.hasCamera();
          console.log(`📷 Camera available: ${result}`);
          setHasCamera(result);
          setAiStatus('idle');
        } catch (error) {
          console.error('❌ Camera check failed:', error);
          setHasCamera(false);
          setAiStatus('idle');
        }
      }
    };
    initialize();
  }, [platform]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        utoVisionAPI.stopCamera();
      }
      if (autoCloseTimer.current) {
        clearTimeout(autoCloseTimer.current);
      }
    };
  }, [stream]);

  const startAI = useCallback(async () => {
    console.log(`🚀 Starting AI Assistant (platform: ${platform})`);
    
    // TV platform - always show QR code for mobile connection
    if (platform === 'tv') {
      console.log('📺 TV detected - showing QR code for mobile device connection');
      setShowQR(true);
      setAiStatus('idle');
      addResponse({
        type: 'info',
        message: '📱 Scan QR code with your mobile device to connect and use its camera for AI analysis',
        timestamp: Date.now()
      });
      return;
    }

    // Desktop/Mobile - use local camera directly
    if (!hasCamera) {
      console.log('❌ No camera available');
      setAiStatus('error');
      setApiError('No camera detected on this device');
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

      // Set 2-minute auto-close timer
      autoCloseTimer.current = setTimeout(() => {
        console.log('⏰ 2-minute timer expired - closing AI Assistant');
        stopAI();
        addResponse({
          type: 'info',
          message: '⏰ AI Assistant closed after 2 minutes. Click to restart.',
          timestamp: Date.now()
        });
      }, 2 * 60 * 1000); // 2 minutes

      // Start continuous analysis
      const plantContext = {
        plant_id: 'pot-01',
        species: plantData?.plant?.species_key || 'monstera',
        soil_raw: plantData?.lastReading?.soil_raw,
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
      
      // More helpful error message
      let errorMsg = 'Failed to access camera. ';
      if (error.message.includes('Permission denied') || error.name === 'NotAllowedError') {
        errorMsg += 'Please allow camera access in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMsg += 'No camera detected on this device.';
      } else if (error.name === 'NotReadableError') {
        errorMsg += 'Camera is already in use by another app.';
      } else {
        errorMsg += error.message || 'Unknown error.';
      }
      
      setApiError(errorMsg);
      addResponse({
        type: 'error',
        message: errorMsg,
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
    if (autoCloseTimer.current) {
      clearTimeout(autoCloseTimer.current);
      autoCloseTimer.current = null;
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
      // recommendations is an array of strings
      recommendations.forEach((rec, index) => {
        if (rec && rec.trim()) {
          addResponse({
            type: 'analysis',
            message: `💡 ${rec}`,
            timestamp: Date.now() + index // Slight offset to maintain order
          });
        }
      });
    }
  }, [addResponse]);

  const handleAnalysisError = useCallback((error) => {
    console.error('❌ AI Analysis error:', error);
    // Set API error to show in status indicator instead of chat
    setApiError(error.message || 'Unknown error occurred');
    setAiStatus('error');
  }, []);

  const clearResponses = useCallback(() => {
    setResponses([]);
  }, []);

  const takeSnapshot = useCallback(async () => {
    if (!videoRef.current || aiStatus !== 'active') {
      console.warn('⚠️ Cannot take snapshot - camera not active');
      return;
    }

    console.log('📸 Taking manual snapshot...');
    setApiError(null); // Clear any previous errors
    setIsAnalyzing(true); // NEW: Start loading state

    try {
      const plantContext = {
        plant_id: 'pot-01',
        species: plantData?.plant?.species_key || 'monstera',
        soil_raw: plantData?.lastReading?.soil_raw,
        lastWatered: plantData?.plant?.last_watered,
        healthStatus: plantData?.status
      };

      setAnalysisProgress('📸 Capturing frames...'); // NEW
      addResponse({
        type: 'info',
        message: '📸 Capturing snapshot and analyzing...',
        timestamp: Date.now()
      });

      // Capture 3 frames from video
      const frames = await utoVisionAPI.capture3Frames(videoRef.current);
      console.log(`✅ Captured ${frames.length} frames`);

      setAnalysisProgress('🧠 AI analyzing plant health... (30-60s)'); // NEW
      // Send to API
      const result = await utoVisionAPI.analyzeHealth(frames, plantContext);

      setAnalysisProgress('✅ Analysis complete!'); // NEW
      handleAnalysisResult(result);
    } catch (error) {
      console.error('❌ Snapshot failed:', error);
      setAnalysisProgress(''); // NEW: Clear on error
      handleAnalysisError(error);
    } finally {
      setIsAnalyzing(false); // NEW: End loading state
      setTimeout(() => setAnalysisProgress(''), 2000); // NEW: Clear success message after 2s
    }
  }, [aiStatus, plantData, addResponse, handleAnalysisResult, handleAnalysisError]);

  const toggleQR = useCallback(() => {
    setShowQR(prev => !prev);
  }, []);

  return {
    aiStatus,
    hasCamera,
    responses,
    showQR,
    apiError,
    isAnalyzing, // NEW: Loading state for AI processing
    analysisProgress, // NEW: Progress message
    videoRef,
    startAI,
    stopAI,
    toggleQR,
    clearResponses,
    takeSnapshot
  };
}
