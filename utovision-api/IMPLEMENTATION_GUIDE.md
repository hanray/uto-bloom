# Ollama Integration Guide

Mock data has been removed. Follow these steps to integrate real AI vision analysis.

## Prerequisites

### 1. Install Ollama
```bash
# Windows: Download from https://ollama.ai
# Or use winget:
winget install Ollama.Ollama
```

### 2. Pull a Vision Model
```bash
# Option 1: Llava (recommended for quick start)
ollama pull llava

# Option 2: Qwen2-VL (better quality, larger)
ollama pull qwen2-vl

# Option 3: Llava-Llama3 (good balance)
ollama pull llava-llama3
```

### 3. Verify Ollama is Running
```bash
# Check status
curl http://localhost:11434/api/tags

# Test basic generation
ollama run llava "Describe this image" --image test.jpg
```

## Implementation Steps

### Step 1: Install Required Dependencies

```bash
npm install node-fetch
```

### Step 2: Create Ollama Service

Create `services/ollamaService.js`:

```javascript
const fetch = require('node-fetch');

class OllamaService {
  constructor(host = 'http://localhost:11434', model = 'llava') {
    this.host = host;
    this.model = model;
  }

  async analyzeImage(frames, prompt) {
    try {
      // Clean base64 strings (remove data:image prefix)
      const cleanFrames = frames.map(frame => 
        frame.replace(/^data:image\/\w+;base64,/, '')
      );

      const response = await fetch(`${this.host}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          images: cleanFrames,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Ollama analysis failed:', error);
      throw error;
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.host}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels() {
    const response = await fetch(`${this.host}/api/tags`);
    const data = await response.json();
    return data.models;
  }
}

module.exports = OllamaService;
```

### Step 3: Create Prompt Builder

Create `services/promptBuilder.js`:

```javascript
function buildPlantAnalysisPrompt(question, context) {
  const { species, current_moisture, temperature_c, humidity_percent, light_lux } = context;

  return `You are a plant health expert analyzing images of a ${species || 'plant'}.

Current Sensor Data:
- Soil Moisture: ${(current_moisture * 100).toFixed(0)}%
- Temperature: ${temperature_c}°C
- Humidity: ${humidity_percent}%
- Light: ${light_lux} lux

Question: ${question}

Please analyze the plant images and provide:
1. Overall health assessment (Great/Good/Fair/Needs Attention)
2. Visual symptoms you observe (leaf color, texture, spots, pests, etc.)
3. How the visual condition correlates with the sensor data
4. Specific care recommendations with priority levels
5. Your confidence level (0-1)

Format your response as a structured analysis.`;
}

module.exports = { buildPlantAnalysisPrompt };
```

### Step 4: Create Response Parser

Create `services/responseParser.js`:

```javascript
function parseOllamaResponse(aiResponse, context) {
  // Parse AI's text response into structured format
  // This is a simple parser - enhance based on your model's output
  
  const healthMatch = aiResponse.match(/health[:\s]+(Great|Good|Fair|Needs Attention)/i);
  const overallHealth = healthMatch ? healthMatch[1] : 'Good';

  const confidenceMatch = aiResponse.match(/confidence[:\s]+(\d+\.?\d*)/i);
  const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.75;

  // Extract symptoms (simple approach - enhance as needed)
  const symptoms = extractSymptoms(aiResponse);
  const recommendations = extractRecommendations(aiResponse);

  return {
    success: true,
    timestamp: new Date().toISOString(),
    health_assessment: {
      overall_health: overallHealth,
      confidence: confidence,
      visual_symptoms: symptoms,
      ai_analysis: aiResponse,
      diagnosis: {
        primary_issue: symptoms[0]?.symptom || 'Analysis complete',
        confidence: confidence
      }
    },
    care_recommendations: recommendations,
    metadata: {
      model_used: process.env.OLLAMA_MODEL || 'llava',
      processing_time_ms: 0, // Will be set by caller
      is_mock_data: false,
      ai_powered: true
    }
  };
}

function extractSymptoms(text) {
  // TODO: Implement proper extraction based on your model's format
  return [
    {
      symptom: 'AI analysis available',
      severity: 'info',
      affected_area: 'Overall',
      confidence: 0.9
    }
  ];
}

function extractRecommendations(text) {
  // TODO: Implement proper extraction
  return [
    {
      action: 'Review AI analysis',
      priority: 'medium',
      details: text.substring(0, 200),
      estimated_recovery_time: 'Varies'
    }
  ];
}

module.exports = { parseOllamaResponse };
```

### Step 5: Update server.js

Replace the mock analysis section with:

```javascript
const OllamaService = require('./services/ollamaService');
const { buildPlantAnalysisPrompt } = require('./services/promptBuilder');
const { parseOllamaResponse } = require('./services/responseParser');

const ollama = new OllamaService(
  process.env.OLLAMA_HOST,
  process.env.OLLAMA_MODEL
);

// In the /api/analyze/plant endpoint:
app.post('/api/analyze/plant', validateApiKey, async (req, res) => {
  const startTime = Date.now();
  console.log('🔬 AI plant analysis request received');
  
  const { frames, question, context, options } = req.body;

  // Validate request
  if (!frames || !Array.isArray(frames) || frames.length === 0) {
    return res.status(400).json({
      error: {
        code: 'MISSING_REQUIRED_FIELD',
        message: 'Frames array is required (at least 1 frame)'
      }
    });
  }

  try {
    // Check Ollama health
    const isHealthy = await ollama.checkHealth();
    if (!isHealthy) {
      return res.status(503).json({
        error: {
          code: 'MODEL_UNAVAILABLE',
          message: 'Ollama service is not available. Please start Ollama.',
          details: 'Run: ollama serve'
        }
      });
    }

    // Build prompt
    const prompt = buildPlantAnalysisPrompt(question, context);
    console.log('📝 Prompt:', prompt.substring(0, 100) + '...');

    // Call Ollama
    console.log('🤖 Calling Ollama...');
    const aiResponse = await ollama.analyzeImage(frames, prompt);
    console.log('✅ AI response received:', aiResponse.substring(0, 100) + '...');

    // Parse response
    const analysis = parseOllamaResponse(aiResponse, context);
    analysis.metadata.processing_time_ms = Date.now() - startTime;

    console.log(`✅ Analysis complete in ${analysis.metadata.processing_time_ms}ms`);
    res.json(analysis);

  } catch (error) {
    console.error('❌ Analysis failed:', error);
    res.status(500).json({
      error: {
        code: 'ANALYSIS_FAILED',
        message: 'AI analysis failed',
        details: error.message
      }
    });
  }
});
```

## Testing

### 1. Start Ollama
```bash
ollama serve
```

### 2. Verify Model is Loaded
```bash
ollama list
```

### 3. Start Your API
```bash
cd utovision-api
.\start-server.ps1
```

### 4. Run Test
```bash
cd ..
.\test-api.ps1
```

## Troubleshooting

### Ollama Not Responding
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama
ollama serve

# Or restart Ollama service
```

### Model Not Found
```bash
# List installed models
ollama list

# Pull required model
ollama pull llava
```

### Slow Response Times
- Use smaller models (llava vs qwen2-vl)
- Reduce image resolution before sending
- Enable GPU acceleration if available

### Out of Memory
- Use llava (4.7GB) instead of qwen2-vl (23.5GB)
- Close other applications
- Reduce concurrent requests

## Performance Optimization

### 1. Image Preprocessing
Resize images before sending to Ollama:

```javascript
// In client before sending
const MAX_DIMENSION = 1024;
// Resize image to max 1024x1024
```

### 2. Caching
Cache responses for identical images:

```javascript
const crypto = require('crypto');

function getImageHash(base64Image) {
  return crypto.createHash('sha256').update(base64Image).digest('hex');
}
```

### 3. Response Streaming
For real-time feedback, enable streaming:

```javascript
body: JSON.stringify({
  model: this.model,
  prompt: prompt,
  images: cleanFrames,
  stream: true  // Enable streaming
})
```

## Next Steps

1. Implement the services as outlined above
2. Test with real plant images
3. Refine prompts based on model responses
4. Implement response parsing logic
5. Add caching for performance
6. Monitor and optimize

## Additional Resources

- [Ollama Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Llava Model Card](https://ollama.ai/library/llava)
- [Qwen2-VL Model Card](https://ollama.ai/library/qwen2-vl)
