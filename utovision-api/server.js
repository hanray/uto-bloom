/**
 * UtoVision API - Mock AI Plant Analysis Service
 * Provides plant health assessment based on camera images and sensor data
 * Port: 3001
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.API_KEY || 'sk_dev_utobloom_2025';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// API Key validation middleware
const validateApiKey = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log('❌ Missing Authorization header');
    return res.status(401).json({
      error: {
        code: 'INVALID_API_KEY',
        message: 'API key required. Include Authorization: Bearer <API_KEY> header.'
      }
    });
  }

  const providedKey = authHeader.replace('Bearer ', '');
  
  if (providedKey !== API_KEY) {
    console.log('❌ Invalid API key:', providedKey);
    return res.status(401).json({
      error: {
        code: 'INVALID_API_KEY',
        message: 'Invalid API key provided.'
      }
    });
  }

  console.log('✅ API key validated');
  next();
};

/**
 * POST /api/analyze/plant
 * Visual plant health analysis
 * 
 * Request body:
 * {
 *   frames: ["base64-frame1", "base64-frame2", "base64-frame3"],
 *   question: "Does my plant look healthy and well today?",
 *   context: {
 *     plant_id: "pot-01",
 *     species: "monstera"
 *   },
 *   options: {
 *     include_care_recommendations: true,
 *     analysis_type: "visual_inspection"
 *   }
 * }
 */
app.post('/api/analyze/plant', validateApiKey, (req, res) => {
  const startTime = Date.now();
  console.log('🔬 Visual plant analysis request received');
  
  const { frames, question, context, options } = req.body;

  // Validate request
  if (!frames || !Array.isArray(frames) || frames.length === 0) {
    console.log('❌ Missing frames data');
    return res.status(400).json({
      error: {
        code: 'MISSING_REQUIRED_FIELD',
        message: 'Frames array is required (at least 1 frame)'
      }
    });
  }

  console.log('📊 Visual Analysis Request:');
  console.log(`   Question: "${question}"`);
  console.log(`   Frames: ${frames.length}`);
  frames.forEach((frame, i) => {
    console.log(`     Frame ${i + 1}: ${frame.length} bytes`);
  });
  console.log(`   Plant: ${context?.species || 'unknown'} (${context?.plant_id})`);

  // Simulate AI visual analysis
  const analysis = generateVisualAnalysis(frames, question, context);
  
  const processingTime = Date.now() - startTime;
  console.log(`✅ Visual analysis complete in ${processingTime}ms`);
  console.log(`   Health: ${analysis.health_assessment.overall_health}`);
  console.log(`   Confidence: ${(analysis.health_assessment.confidence * 100).toFixed(0)}%`);

  res.json(analysis);
});

/**
 * Generate mock visual plant analysis
 * Simulates AI looking at plant images and answering: "Does my plant look healthy?"
 */
function generateVisualAnalysis(frames, question, context) {
  // Simulate visual inspection results (in real AI, this would analyze the actual images)
  // For now, randomize results to simulate different visual conditions
  const visualScores = {
    leafColor: 0.7 + Math.random() * 0.3, // 70-100%
    leafTexture: 0.6 + Math.random() * 0.4,
    leafSize: 0.7 + Math.random() * 0.3,
    overallAppearance: 0.65 + Math.random() * 0.35
  };

  const avgScore = Object.values(visualScores).reduce((a, b) => a + b) / 4;
  
  let overallHealth = 'Great';
  let primaryIssue = null;
  let severity = 'none';
  let confidence = 0.80 + Math.random() * 0.15;
  const symptoms = [];
  const recommendations = [];

  // Simulate different visual conditions
  if (avgScore < 0.5) {
    overallHealth = 'Needs Attention';
    primaryIssue = 'Visual signs of stress detected';
    severity = 'high';
    confidence = 0.88;
    symptoms.push({
      symptom: 'Discolored leaves',
      severity: 'high',
      affected_area: 'Lower leaves',
      confidence: 0.85
    });
    symptoms.push({
      symptom: 'Possible nutrient deficiency',
      severity: 'moderate',
      affected_area: 'New growth',
      confidence: 0.72
    });
    recommendations.push({
      action: 'Check plant care routine',
      priority: 'high',
      details: 'Plant shows visual signs of stress. Check watering schedule and light exposure.',
      estimated_recovery_time: '1-2 weeks'
    });
  } else if (avgScore < 0.7) {
    overallHealth = 'Fair';
    primaryIssue = 'Minor visual issues observed';
    severity = 'moderate';
    confidence = 0.82;
    symptoms.push({
      symptom: 'Slight leaf drooping',
      severity: 'mild',
      affected_area: 'Some leaves',
      confidence: 0.78
    });
    recommendations.push({
      action: 'Monitor plant closely',
      priority: 'medium',
      details: 'Plant looks generally okay but shows minor stress signs. Keep observing.',
      estimated_recovery_time: '3-7 days'
    });
  } else if (avgScore < 0.85) {
    overallHealth = 'Good';
    primaryIssue = 'Plant appears healthy';
    severity = 'low';
    confidence = 0.85;
    symptoms.push({
      symptom: 'Healthy appearance',
      severity: 'none',
      affected_area: 'Overall plant',
      confidence: 0.90
    });
    recommendations.push({
      action: 'Continue current care',
      priority: 'low',
      details: 'Plant looks good! Maintain your current care routine.',
      estimated_recovery_time: 'N/A'
    });
  } else {
    overallHealth = 'Great';
    primaryIssue = 'Plant thriving';
    severity = 'none';
    confidence = 0.92;
    symptoms.push({
      symptom: 'Vibrant, healthy foliage',
      severity: 'none',
      affected_area: 'All leaves',
      confidence: 0.95
    });
    recommendations.push({
      action: 'Keep up the great work',
      priority: 'low',
      details: 'Your plant looks fantastic! Whatever you\'re doing is working perfectly.',
      estimated_recovery_time: 'N/A'
    });
  }

  return {
    success: true,
    timestamp: new Date().toISOString(),
    health_assessment: {
      overall_health: overallHealth,
      confidence: confidence,
      visual_symptoms: symptoms,
      visual_scores: visualScores,
      frames_analyzed: frames.length,
      diagnosis: {
        primary_issue: primaryIssue,
        contributing_factors: [],
        confidence: confidence
      }
    },
    care_recommendations: recommendations,
    metadata: {
      model_used: 'visual-inspection-v1',
      processing_time_ms: Math.floor(Math.random() * 800) + 1200,
      frames_processed: frames.length,
      question_answered: question
    }
  };
}

/**
 * GET /api/status
 * Service health check
 */
app.get('/api/status', (req, res) => {
  console.log('🔍 Status check');
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    service: {
      status: 'operational',
      uptime_seconds: Math.floor(process.uptime()),
      version: '1.0.0'
    },
    endpoints: {
      'POST /api/analyze/plant': 'Plant health analysis',
      'GET /api/status': 'Service status'
    }
  });
});

/**
 * GET /
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    service: 'UtoVision API',
    version: '1.0.0',
    description: 'AI-powered plant vision analysis',
    documentation: '/api/status',
    endpoints: [
      'POST /api/analyze/plant - Analyze plant health',
      'GET /api/status - Check service status'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal error occurred',
      details: err.message
    }
  });
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 Not Found:', req.path);
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.path} not found`,
      available_endpoints: [
        'POST /api/analyze/plant',
        'GET /api/status',
        'GET /'
      ]
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║      UtoVision API Service v1.0.0      ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔑 API Key: ${API_KEY}`);
  console.log('');
  console.log('📡 Available endpoints:');
  console.log(`   POST http://localhost:${PORT}/api/analyze/plant`);
  console.log(`   GET  http://localhost:${PORT}/api/status`);
  console.log('');
  console.log('💡 Ready to analyze plants!');
  console.log('');
});
