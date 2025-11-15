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

  // TODO: Integrate with Ollama for real AI analysis
  // This is a placeholder - implement real AI analysis here
  console.log('⚠️  WARNING: Mock data removed. Real AI integration required!');
  
  res.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Real AI analysis not yet implemented. Please integrate Ollama vision model.',
      details: {
        required_steps: [
          'Install Ollama: https://ollama.ai',
          'Pull vision model: ollama pull qwen2-vl or ollama pull llava',
          'Implement analyzeWithOllama() function',
          'Configure OLLAMA_HOST in .env'
        ]
      }
    }
  });
});

/**
 * Analyze plant health using Ollama vision model
 * TODO: Implement real Ollama integration
 * 
 * Example implementation:
 * 
 * const analyzeWithOllama = async (frames, question, context) => {
 *   const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
 *   const model = process.env.OLLAMA_MODEL || 'llava';
 *   
 *   const response = await fetch(`${ollamaHost}/api/generate`, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({
 *       model: model,
 *       prompt: buildPlantAnalysisPrompt(question, context),
 *       images: frames.map(f => f.replace(/^data:image\/\w+;base64,/, '')),
 *       stream: false
 *     })
 *   });
 *   
 *   const data = await response.json();
 *   return parseOllamaResponse(data.response, context);
 * };
 */

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
