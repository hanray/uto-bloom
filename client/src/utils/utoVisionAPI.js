/**
 * UtoVision API Integration
 * Handles camera access, API communication, and AI analysis
 */

const UTOVISION_API_URL = 'http://localhost:3001';
const API_KEY = 'sk_dev_utobloom_2025';
const USE_MOCK_MODE = false; // Set to false - only use real API responses

class UtoVisionAPI {
  constructor() {
    this.apiUrl = UTOVISION_API_URL;
    this.apiKey = API_KEY;
    this.stream = null;
    this.videoElement = null;
    this.analysisInterval = null;
    this.mockMode = USE_MOCK_MODE;
    this.apiAvailable = null; // null = unknown, true = available, false = unavailable
  }

  /**
   * Check if device has camera capability
   */
  async hasCamera() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error checking for camera:', error);
      return false;
    }
  }

  /**
   * Request camera access
   */
  async requestCameraAccess() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Prefer back camera on mobile
        }
      });
      return this.stream;
    } catch (error) {
      console.error('Camera access denied:', error);
      throw new Error('Camera access denied');
    }
  }

  /**
   * Stop camera stream
   */
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
  }

  /**
   * Capture frame from video stream
   * Returns smaller image for API (400px max width, 0.5 quality)
   */
  captureFrame(videoElement) {
    const canvas = document.createElement('canvas');
    // Smaller size to reduce payload - visual inspection doesn't need high res
    const maxWidth = 300;
    const scale = Math.min(1, maxWidth / videoElement.videoWidth);
    canvas.width = videoElement.videoWidth * scale;
    canvas.height = videoElement.videoHeight * scale;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    // Use lower quality for much smaller file size
    return canvas.toDataURL('image/jpeg', 0.3).split(',')[1]; // Return base64 without prefix
  }

  /**
   * Capture 2 frames from video for multi-angle analysis
   * Captures with 200ms delay between frames
   */
  async capture3Frames(videoElement) {
    const frames = [];
    for (let i = 0; i < 2; i++) {
      if (i > 0) {
        // Small delay between captures to get slightly different angles/lighting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      frames.push(this.captureFrame(videoElement));
    }
    return frames;
  }

  /**
   * Make API request
   */
  async _fetch(endpoint, method = 'POST', body = null) {
    const url = `${this.apiUrl}${endpoint}`;
    console.log(`📡 API Request: ${method} ${url}`);
    
    try {
      const options = {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        mode: 'cors' // Explicitly set CORS mode
      };

      if (body) {
        options.body = JSON.stringify(body);
        console.log('📦 Request payload:', {
          image_size: body.image?.length || 0,
          context: body.context,
          options: body.options
        });
      }

      const response = await fetch(url, options);
      console.log(`📨 Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          error: { message: `HTTP ${response.status}: ${response.statusText}` } 
        }));
        throw new Error(error.error?.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ API Fetch Error:', error);
      // Check if it's a network error
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to AI API. Please ensure UtoVision API server is running on localhost:3001');
      }
      throw error;
    }
  }

  /**
   * Analyze plant health with visual inspection (3 frames)
   * Sends: "Does my plant look healthy and well today?" + images + soil moisture
   * Combines visual analysis with current soil moisture reading
   */
  async analyzeHealth(frames, plantContext) {
    console.log('🔬 Starting visual plant health analysis');
    console.log(`   📸 Sending ${frames.length} frames`);
    frames.forEach((frame, i) => {
      console.log(`   Frame ${i + 1}: ${frame.length} bytes`);
    });
    console.log('   🌱 Question: "Does my plant look healthy and well today?"');
    console.log('   📊 Sensor data:', {
      soil_raw: plantContext.soil_raw
    });
    
    try {
      const result = await this._fetch('/api/analyze/plant', 'POST', {
        frames: frames, // Send 3 frames for better analysis
        question: `Does my plant look healthy and well today? The soil moisture sensor reads ${plantContext.soil_raw || 'N/A'} (0-1023 scale, where higher = wetter).`,
        context: {
          plant_id: plantContext.plant_id || 'pot-01',
          species: plantContext.species || 'unknown',
          sensor_data: {
            soil_moisture_raw: plantContext.soil_raw
          }
        },
        options: {
          include_care_recommendations: true,
          analysis_type: 'visual_inspection'
        }
      });
      
      console.log('✅ API visual analysis successful:', result);
      this.apiAvailable = true;
      return result;
    } catch (error) {
      this.apiAvailable = false;
      console.error('❌ API analysis failed:', error.message);
      throw error;
    }
  }

  /**
   * REMOVED: Mock health response - now using real API only
   */
  _getMockHealthResponse_DEPRECATED(plantContext) {
    const moisture = plantContext.moisture || 50;
    const temp = plantContext.temperature || 22;
    let health = 'Great';
    let issue = null;
    let recommendation = null;
    let priority = 'low';

    console.log(`🌡️ Mock analysis - Moisture: ${moisture}%, Temp: ${temp}°C`);

    if (moisture < 30) {
      health = 'Needs Water';
      issue = 'Low soil moisture detected';
      recommendation = 'Water immediately - soil is too dry';
      priority = 'high';
    } else if (moisture > 80) {
      health = 'Over-watered';
      issue = 'Soil moisture very high';
      recommendation = 'Let soil dry out before next watering. Risk of root rot.';
      priority = 'high';
    } else if (moisture < 45) {
      health = 'Fair';
      issue = 'Soil moisture getting low';
      recommendation = 'Consider watering within 24 hours';
      priority = 'medium';
    } else {
      health = 'Great';
      recommendation = 'Plant is healthy. Maintain current care routine.';
      priority = 'low';
    }

    // Temperature checks
    if (temp < 15) {
      health = 'Too Cold';
      issue = 'Temperature below ideal range';
      recommendation = 'Move plant to warmer location (15-30°C ideal)';
      priority = 'high';
    } else if (temp > 30) {
      health = 'Too Hot';
      issue = 'Temperature above ideal range';
      recommendation = 'Move plant to cooler location or increase air circulation';
      priority = 'high';
    }

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      health_assessment: {
        overall_health: health,
        confidence: 0.85 + Math.random() * 0.1,
        visual_symptoms: issue ? [{ symptom: issue, severity: priority === 'high' ? 'high' : 'moderate' }] : [],
        diagnosis: issue ? {
          primary_issue: issue,
          contributing_factors: [],
          confidence: 0.82
        } : null
      },
      care_recommendations: [{
        action: recommendation,
        priority: priority,
        details: `Moisture: ${moisture}%, Temp: ${temp}°C`,
        estimated_recovery_time: priority === 'high' ? '24-48 hours' : 'N/A'
      }],
      metadata: {
        model_used: 'sensor-based-analysis',
        processing_time_ms: 100 + Math.random() * 200,
        sensor_data_used: true
      }
    };

    console.log('📊 Mock response generated:', response);
    return response;
  }

  /**
   * Quick plant identification
   */
  async identifyPlant(imageBase64) {
    return await this._fetch('/api/analyze', 'POST', {
      image: imageBase64,
      options: {
        prompt: 'Identify this plant species and describe its current health.',
        confidence_threshold: 0.70
      }
    });
  }

  /**
   * Detect issues and pests
   */
  async detectIssues(imageBase64) {
    return await this._fetch('/api/analyze/detect-issues', 'POST', {
      image: imageBase64,
      focus_areas: ['leaf spots', 'pests', 'discoloration', 'wilting'],
      options: {
        early_detection_mode: true
      }
    });
  }

  /**
   * Check API health
   */
  async checkStatus() {
    try {
      return await this._fetch('/api/status', 'GET');
    } catch (error) {
      console.error('API status check failed:', error);
      return { available: false, error: error.message };
    }
  }

  /**
   * Start continuous analysis (every 30 seconds)
   */
  startContinuousAnalysis(videoElement, plantContext, onResult, onError) {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }

    // Run immediately
    this._runAnalysis(videoElement, plantContext, onResult, onError);

    // Then every 30 seconds
    this.analysisInterval = setInterval(() => {
      this._runAnalysis(videoElement, plantContext, onResult, onError);
    }, 30000);
  }

  async _runAnalysis(videoElement, plantContext, onResult, onError) {
    try {
      console.log('📸 Capturing 3 frames from video for multi-angle analysis...');
      const frames = await this.capture3Frames(videoElement);
      const totalSize = frames.reduce((sum, f) => sum + f.length, 0);
      console.log(`📦 3 frames captured (${totalSize} bytes total)`);
      console.log('🌱 Plant:', plantContext.species || 'unknown');
      
      const result = await this.analyzeHealth(frames, plantContext);
      console.log('✨ Visual analysis complete:', result);
      onResult(result);
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      onError(error);
    }
  }
}

export default new UtoVisionAPI();
