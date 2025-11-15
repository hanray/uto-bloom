/**
 * UtoVision API - AI Plant Analysis Service with Ollama Integration
 * Provides plant health assessment based on camera images using Ollama llava model
 * Port: 3001
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Ollama } = require('ollama');

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.API_KEY || 'sk_dev_utobloom_2025';
const USE_REAL_AI = process.env.USE_REAL_AI === 'true';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3-vl:32b';

// Model selection - Fast model for simple queries, powerful model for complex analysis
const FAST_MODEL = 'qwen3-vl:8b';    // 6.1GB, ~2-3s analysis
const SMART_MODEL = 'qwen3-vl:32b';  // 20GB, ~60-100s analysis
const ENABLE_SMART_ROUTING = process.env.ENABLE_SMART_ROUTING !== 'false'; // Default: enabled

// Initialize Ollama client
const ollama = new Ollama({ host: OLLAMA_HOST });

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files for mobile camera interface
app.use(express.static(path.join(__dirname, 'public')));

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

  // Choose analysis method based on USE_REAL_AI flag
  if (USE_REAL_AI) {
    analyzeWithOllama(frames, question, context, options, res, startTime);
  } else {
    // Mock analysis for testing
    const analysis = generateVisualAnalysis(frames, question, context);
    const processingTime = Date.now() - startTime;
    console.log(`✅ Mock analysis complete in ${processingTime}ms`);
    console.log(`   Health: ${analysis.health_assessment.overall_health}`);
    console.log(`   Confidence: ${(analysis.health_assessment.confidence * 100).toFixed(0)}%`);
    res.json(analysis);
  }
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
 * Smart model selection based on query complexity
 * Simple queries use fast model, complex analysis uses powerful model
 */
function selectModel(question, context) {
  if (!ENABLE_SMART_ROUTING) {
    console.log(`🔀 Smart routing disabled - using: ${OLLAMA_MODEL}`);
    return OLLAMA_MODEL;
  }

  const questionLower = question.toLowerCase();
  
  // Simple queries - use fast model (8b)
  const simpleKeywords = [
    'look healthy',
    'is my plant',
    'quick check',
    'status',
    'color',
    'how is',
    'doing well'
  ];
  
  // Complex queries - use smart model (32b)
  const complexKeywords = [
    'disease',
    'pest',
    'diagnosis',
    'identify',
    'what is wrong',
    'problem',
    'yellowing',
    'brown spots',
    'wilting',
    'treatment',
    'cure',
    'detailed analysis'
  ];

  // Check for complex indicators
  const isComplex = complexKeywords.some(keyword => questionLower.includes(keyword));
  const isSimple = simpleKeywords.some(keyword => questionLower.includes(keyword));

  // Decision logic
  if (isComplex) {
    console.log(`🧠 Complex query detected - using SMART model: ${SMART_MODEL}`);
    console.log(`   Reason: Requires detailed analysis`);
    return SMART_MODEL;
  } else if (isSimple || questionLower.length < 50) {
    console.log(`⚡ Simple query detected - using FAST model: ${FAST_MODEL}`);
    console.log(`   Reason: Quick health check`);
    return FAST_MODEL;
  } else {
    // Default to fast model for general queries
    console.log(`⚡ General query - using FAST model: ${FAST_MODEL}`);
    return FAST_MODEL;
  }
}

/**
 * Analyze plant health using Ollama vision model
 */
async function analyzeWithOllama(frames, question, context, options, res, startTime) {
  try {
    console.log('🤖 Starting Ollama analysis...');
    
    // Smart model selection
    const selectedModel = selectModel(question, context);
    
    // Build the prompt with plant context
    const prompt = buildPlantAnalysisPrompt(question, context);
    
    // Clean base64 frames (remove data:image/... prefix if present)
    const cleanedFrames = frames.map(frame => 
      frame.replace(/^data:image\/\w+;base64,/, '')
    );
    
    console.log(`📤 Sending to Ollama: ${selectedModel}`);
    console.log(`   Prompt: ${prompt.substring(0, 100)}...`);
    console.log(`   Images: ${cleanedFrames.length} frames`);
    console.log(`   ⏳ Processing... (this may take 10-60 seconds)`);
    
    const analyzeStart = Date.now();
    
    // Call Ollama API with selected model
    const response = await ollama.generate({
      model: selectedModel,
      prompt: prompt,
      images: cleanedFrames,
      stream: false
    });
    
    console.log('✅ Ollama response received');
    const analyzeTime = Date.now() - analyzeStart;
    console.log(`   ⏱️  Analysis took ${analyzeTime}ms (${(analyzeTime/1000).toFixed(1)}s)`);
    console.log(`   Raw response length: ${response.response.length} chars`);
    
    // Parse Ollama's text response into structured format
    const analysis = parseOllamaResponse(response.response, context);
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ AI analysis complete in ${processingTime}ms`);
    console.log(`   Health: ${analysis.health_assessment.overall_health}`);
    console.log(`   Confidence: ${(analysis.health_assessment.confidence * 100).toFixed(0)}%`);
    
    res.json(analysis);
    
  } catch (error) {
    console.error('❌ Ollama analysis failed - DETAILED ERROR:');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Status:', error.status_code);
    console.error('Full Error Object:', JSON.stringify(error, null, 2));
    
    if (error.stack) {
      console.error('Stack Trace:', error.stack);
    }
    
    // Try to get more details from the error
    const errorDetails = {
      name: error.name,
      message: error.message,
      code: error.code,
      status_code: error.status_code,
      error: error.error,
      cause: error.cause,
      full_error: error
    };
    
    console.error('Structured Error Details:', JSON.stringify(errorDetails, null, 2));
    
    res.status(500).json({
      error: {
        code: 'AI_ANALYSIS_FAILED',
        message: 'Failed to analyze plant with AI',
        details: error.message,
        error_name: error.name,
        error_code: error.code,
        status_code: error.status_code,
        ollama_error: error.error,
        full_details: errorDetails
      }
    });
  }
}

/**
 * Build a detailed prompt for plant analysis
 */
function buildPlantAnalysisPrompt(question, context) {
  const species = context?.species || 'unknown plant';
  const plantId = context?.plant_id || 'unknown';
  
  return `You are an expert botanist analyzing images of a ${species} (ID: ${plantId}).

User Question: ${question}

Analyze the plant images and provide:
1. Overall health assessment (healthy, needs_attention, critical, unknown)
2. Specific observations about leaves, stems, soil, and overall appearance
3. Any visible issues like yellowing, wilting, pests, or disease
4. Care recommendations based on what you see

Please respond in a structured format with clear health status and specific observations.`;
}

/**
 * Parse Ollama's text response into structured JSON
 */
function parseOllamaResponse(aiText, context) {
  console.log('🔍 Parsing AI response...');
  
  // Extract health status from AI text
  let health = 'unknown';
  const textLower = aiText.toLowerCase();
  
  if (textLower.includes('healthy') && !textLower.includes('unhealthy')) {
    health = 'healthy';
  } else if (textLower.includes('needs attention') || textLower.includes('needs_attention')) {
    health = 'needs_attention';
  } else if (textLower.includes('critical') || textLower.includes('severe')) {
    health = 'critical';
  }
  
  // Extract confidence (look for percentages or keywords)
  let confidence = 0.7; // default
  const confidenceMatch = aiText.match(/(\d+)%\s*confident/i);
  if (confidenceMatch) {
    confidence = parseInt(confidenceMatch[1]) / 100;
  } else if (textLower.includes('very confident') || textLower.includes('highly confident')) {
    confidence = 0.9;
  } else if (textLower.includes('somewhat confident') || textLower.includes('moderately')) {
    confidence = 0.6;
  }
  
  // Structure the response
  return {
    success: true,
    health_assessment: {
      overall_health: health,
      confidence: confidence,
      ai_analysis: aiText,
      timestamp: new Date().toISOString()
    },
    observations: {
      leaves: extractObservation(aiText, ['leaves', 'leaf', 'foliage']),
      stems: extractObservation(aiText, ['stem', 'branch', 'stalk']),
      soil: extractObservation(aiText, ['soil', 'dirt', 'substrate']),
      general: aiText.split('\n').slice(0, 3).join(' ') // First few lines as general observation
    },
    care_recommendations: extractRecommendations(aiText),
    metadata: {
      model: OLLAMA_MODEL,
      analysis_type: 'ai_vision',
      frames_analyzed: 3,
      species: context?.species || 'unknown'
    }
  };
}

/**
 * Extract observation about a specific plant part
 */
function extractObservation(text, keywords) {
  const sentences = text.split(/[.!?]+/);
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (keywords.some(keyword => lower.includes(keyword))) {
      return sentence.trim();
    }
  }
  return 'No specific observations';
}

/**
 * Extract care recommendations from AI text
 */
function extractRecommendations(text) {
  const recommendations = [];
  const sentences = text.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (lower.includes('water') || lower.includes('moisture')) {
      recommendations.push(sentence.trim());
    } else if (lower.includes('light') || lower.includes('sun')) {
      recommendations.push(sentence.trim());
    } else if (lower.includes('fertilize') || lower.includes('nutrient')) {
      recommendations.push(sentence.trim());
    } else if (lower.includes('recommend') || lower.includes('should')) {
      recommendations.push(sentence.trim());
    }
  }
  
  return recommendations.slice(0, 3); // Top 3 recommendations
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

/**
 * Generate mock visual analysis for testing
 */
function generateVisualAnalysis(frames, question, context) {
  const healthOptions = ['healthy', 'needs_attention', 'critical'];
  const health = healthOptions[Math.floor(Math.random() * healthOptions.length)];
  
  const mockObservations = {
    healthy: {
      leaves: 'Vibrant green leaves with no signs of discoloration or wilting',
      stems: 'Strong, upright stems with healthy color',
      soil: 'Soil appears moist and well-draining',
      general: 'Plant shows excellent overall health with robust growth'
    },
    needs_attention: {
      leaves: 'Some yellowing visible on lower leaves, possible nutrient deficiency',
      stems: 'Stems appear slightly droopy, may need more support',
      soil: 'Soil looks dry, consider increasing watering frequency',
      general: 'Plant is showing minor stress indicators but overall stable'
    },
    critical: {
      leaves: 'Significant leaf browning and wilting observed',
      stems: 'Stems show signs of weakness or disease',
      soil: 'Soil appears either waterlogged or severely depleted',
      general: 'Plant requires immediate attention to prevent further decline'
    }
  };
  
  const mockRecommendations = {
    healthy: [
      'Continue current care routine',
      'Monitor for any changes in appearance',
      'Maintain consistent watering schedule'
    ],
    needs_attention: [
      'Increase watering frequency to 2-3 times per week',
      'Consider adding balanced fertilizer',
      'Check for proper drainage'
    ],
    critical: [
      'Immediately check root health for rot',
      'Adjust watering schedule based on soil moisture',
      'Consider repotting with fresh soil',
      'Remove severely damaged leaves'
    ]
  };
  
  return {
    success: true,
    health_assessment: {
      overall_health: health,
      confidence: 0.75 + Math.random() * 0.15, // 0.75-0.9
      ai_analysis: `Mock analysis: ${mockObservations[health].general}`,
      timestamp: new Date().toISOString()
    },
    observations: mockObservations[health],
    care_recommendations: mockRecommendations[health],
    metadata: {
      model: 'mock-vision-v1',
      analysis_type: 'mock_testing',
      frames_analyzed: frames.length,
      species: context?.species || 'unknown'
    }
  };
}

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
  console.log('🤖 AI Mode:');
  if (USE_REAL_AI) {
    console.log(`   ✅ REAL AI ENABLED`);
    console.log(`   Model: ${OLLAMA_MODEL}`);
    console.log(`   Host: ${OLLAMA_HOST}`);
  } else {
    console.log(`   🎭 MOCK MODE (set USE_REAL_AI=true for real AI)`);
  }
  console.log('');
  console.log('📡 Available endpoints:');
  console.log(`   POST http://localhost:${PORT}/api/analyze/plant`);
  console.log(`   GET  http://localhost:${PORT}/api/status`);
  console.log(`   GET  http://localhost:${PORT}/mobile-camera.html (Mobile Camera Interface)`);
  console.log('');
  console.log('💡 Ready to analyze plants!');
  console.log('');
});
