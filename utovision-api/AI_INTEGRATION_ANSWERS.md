# UtoVision API - Real AI Integration Guide

**Answers to Implementation Questions**  
**For: UtoBloom Plant Health Analysis with Ollama**

---

## 1. Which Vision Model Should We Use?

**Recommendation: `llava:latest`**

✅ **Use llava:latest because:**
- Already installed and working in your UtoVision setup
- Good balance of speed (~3-5 seconds) and accuracy
- Handles plant images well
- Smaller model (4.7GB vs 23.5GB for qwen3-vl)
- Reliable for houseplant analysis
- Lower memory requirements

⚠️ **Only switch to `qwen3-vl` if:**
- You need higher accuracy for complex disease identification
- You can accept 8-10 second response times
- You have sufficient RAM (24GB+ recommended)

**Decision: Use `llava:latest` for MVP, evaluate qwen3-vl later if needed**

---

## 2. What Level of Accuracy Is Needed?

**Target: Intermediate Level**

### What to Implement:
✅ **General health assessment** (Great/Good/Fair/Needs Attention)  
✅ **Common issues identification:**
- Overwatering symptoms (yellowing lower leaves, soggy soil appearance)
- Underwatering symptoms (wilting, drooping, dry soil appearance)
- Temperature stress (leaf curling, discoloration from cold/heat)
- Pest detection (spider mites, aphids, scale insects - obvious cases)
- Leaf problems (yellowing, browning, spots, holes)

✅ **Correlation with sensors:**
- Visual symptoms + moisture reading = confident diagnosis
- Visual symptoms + temperature reading = stress identification

### What NOT to Implement (Yet):
❌ Specific disease identification (e.g., "Fusarium wilt" vs "Verticillium wilt")  
❌ Precise nutrient deficiency diagnosis (N, P, K, micronutrients)  
❌ Rare pest species identification  
❌ Advanced pathology assessment  

**These can be added in Phase 2 after MVP validation**

---

## 3. Image Analysis Strategy

**Recommendation: Single Comprehensive Call**

### Approach:
```
ONE prompt that requests everything needed
↓
Ollama analyzes image with full context
↓
Returns comprehensive structured response
```

### Why Single Call?
✅ **Simpler to implement and maintain**  
✅ **Faster** - One API call instead of 4-5 sequential calls  
✅ **Better context** - AI sees full picture at once  
✅ **Lower latency** - 3-5 seconds vs 15-25 seconds for multi-step  
✅ **Llava excels at comprehensive analysis**  

### NOT Recommended (Multi-Step):
❌ Step 1: Identify plant species  
❌ Step 2: Detect visual issues  
❌ Step 3: Assess health  
❌ Step 4: Generate recommendations  

**Why avoid?** Too slow (20+ seconds), complex orchestration, higher failure rate

### Implementation:
Single prompt that asks for:
1. Overall health assessment
2. Visual symptoms
3. Sensor data correlation
4. Primary issue identification
5. Care recommendations
6. Confidence score

---

## 4. Sensor Data Integration Strategy

**YES - Sensor Data Is CRITICAL for Accuracy**

### UtoBloom Sensor Data Available:
- **Soil Moisture** (`current_moisture`): 0.0-1.0 scale
- **Temperature** (`temperature_c`): Degrees Celsius

### How to Integrate:

#### Include in Prompt Context:
```javascript
SENSOR READINGS:
- Soil Moisture: ${(current_moisture * 100).toFixed(0)}% 
  (0%=completely dry, 100%=saturated)
- Temperature: ${temperature_c}°C
```

#### Correlation Logic AI Should Apply:
```
Visual + Sensor → Diagnosis Confidence

Examples:
- Wilting leaves + moisture 15% = Underwatering (HIGH confidence)
- Wilting leaves + moisture 85% = Overwatering/root rot (HIGH confidence)
- Wilting leaves + moisture 45% = Other issue, not water (investigate further)
- Yellow leaves + moisture 30% + temp 24°C = Underwatering likely
- Yellow leaves + moisture 60% + temp 18°C = Cold stress possible
- Healthy appearance + moisture 42% + temp 22°C = Confirms healthy status
- Drooping + moisture 70% + temp 15°C = Temperature stress, not water
```

#### Conflict Handling:
Instruct AI: "If visual symptoms conflict with sensor readings, mention BOTH observations and explain the discrepancy."

Example: "Leaves appear dry and wilted, BUT moisture sensor shows 75%. Possible issues: sensor malfunction, root damage preventing water uptake, or recent watering hasn't reached upper soil."

### Implementation Priority:
**HIGH** - This is the key differentiator from generic plant AI apps. Visual + sensor fusion = superior diagnosis.

---

## 5. Response Time Requirements

### Acceptable Response Times:
- **Mock API:** <100ms (removed)
- **Real AI:** 3-10 seconds **← ACCEPTABLE**

### Why This Is Fine for UtoBloom UX:

✅ **User Intent:** AI Assistant is deliberately activated (not real-time monitoring)  
✅ **Camera Capture:** Already takes 1-2 seconds to capture frames  
✅ **User Expectation:** Users expect AI analysis to take time (it signals "thinking")  
✅ **Loading Feedback:** Show progress: "🤖 AI analyzing your plant..."  
✅ **Infrequent Use:** Not triggered every second like live stream  

### UI Implementation:
```javascript
// Show loading state
setAnalyzing(true);
setLoadingMessage("📸 Capturing images...");

// Capture frames
const frames = await captureFrames(3);

setLoadingMessage("🤖 AI analyzing your plant...");

// Call API (3-10 seconds)
const analysis = await analyzeWithAI(frames);

setAnalyzing(false);
// Show results
```

### Do NOT Need:
❌ **Streaming responses** - Single response is fine  
❌ **Progressive analysis** - Not necessary for MVP  
❌ **Real-time updates** - This isn't a live feed  

### Performance Optimization Later:
- Cache results by image hash (1 hour TTL)
- Resize images to max 1024px before sending
- Use GPU acceleration if available

**Decision: 3-10 seconds is acceptable. Implement simple loading spinner.**

---

## 6. Prompt Engineering

### Recommended Prompt Structure:

```javascript
function buildPlantHealthPrompt(question, context) {
  const { species, current_moisture, temperature_c } = context;
  
  return `You are an expert plant care specialist analyzing a ${species || 'houseplant'}.

SENSOR READINGS:
- Soil Moisture: ${(current_moisture * 100).toFixed(0)}% (0%=completely dry, 100%=saturated)
- Temperature: ${temperature_c}°C

USER QUESTION: "${question}"

Analyze the plant image(s) and provide a structured response:

1. OVERALL HEALTH: Choose one: Great | Good | Fair | Needs Attention

2. VISUAL SYMPTOMS: List what you observe in the image:
   - Leaf color (vibrant green, pale, yellow, brown, spotted)
   - Leaf texture (firm, wilting, drooping, crispy, mushy)
   - Leaf condition (holes, spots, discoloration, curling)
   - Pests visible (spider mites, aphids, scale, mealybugs)
   - Soil appearance (if visible)
   - Overall plant structure

3. SENSOR CORRELATION: Analyze how visual condition matches sensor data:
   - Does moisture level (${(current_moisture * 100).toFixed(0)}%) explain any wilting/drooping?
   - Does temperature (${temperature_c}°C) explain stress symptoms?
   - Do visual and sensor readings agree or conflict?
   - If conflicting, explain possible reasons

4. PRIMARY ISSUE: What is the main problem (if any)?
   - Issue name (e.g., "Underwatering", "Pest infestation", "Temperature stress")
   - Severity: none | mild | moderate | high | critical
   - Explanation based on visual + sensor evidence

5. CARE RECOMMENDATIONS: Provide top 3 specific actions:
   - Action 1: [high/medium/low priority] - Specific step with current context
   - Action 2: [high/medium/low priority] - Specific step with current context
   - Action 3: [high/medium/low priority] - Specific step with current context
   - Each recommendation should be actionable (what to do, when, how much)

6. CONFIDENCE: Your confidence in this assessment (0.0 to 1.0)
   - Example: 0.85 means 85% confident

Be specific, actionable, and consider both visual observations and sensor readings together. If sensor data conflicts with visual symptoms, state both and explain.`;
}
```

### Output Format:
**Structured text** - Easier for llava to generate than strict JSON

### Parsing Strategy:
```javascript
function parseOllamaResponse(aiText, context) {
  // Extract sections using regex patterns
  const healthMatch = aiText.match(/OVERALL HEALTH[:\s]+(Great|Good|Fair|Needs Attention)/i);
  const confidenceMatch = aiText.match(/CONFIDENCE[:\s]+(\d\.\d+|\d+%)/i);
  
  // Return structured object
  return {
    health_assessment: {
      overall_health: healthMatch ? healthMatch[1] : 'Good',
      confidence: parseConfidence(confidenceMatch),
      visual_symptoms: extractSymptoms(aiText),
      sensor_correlation: extractCorrelation(aiText),
      raw_ai_response: aiText
    },
    care_recommendations: extractRecommendations(aiText),
    metadata: {
      model_used: 'llava:latest',
      is_mock_data: false,
      ai_powered: true
    }
  };
}
```

---

## 7. Fallback Behavior

### When Ollama Is Offline or Fails:

**Return Clear Error - NO Mock Fallback**

```javascript
// Health check before analysis
const isOllamaHealthy = await checkOllamaHealth();

if (!isOllamaHealthy) {
  return res.status(503).json({
    error: {
      code: 'AI_SERVICE_UNAVAILABLE',
      message: 'AI analysis service is temporarily offline',
      user_message: 'AI assistant is currently unavailable. Please try again in a moment.',
      fallback_action: 'You can still view sensor data in the Details tab',
      retry_after: 60
    }
  });
}
```

### Why NO Mock Fallback:
❌ **Misleading:** User clicked "AI Assistant" expecting real AI  
❌ **Trust issue:** Returning fake data damages credibility  
❌ **Better UX:** Clear error > silent fake results  

### Error Handling Strategy:
```javascript
try {
  const aiResponse = await analyzeWithOllama(frames, question, context);
  return parseAndRespond(aiResponse);
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: {
        code: 'OLLAMA_OFFLINE',
        message: 'Ollama service not running',
        user_message: 'AI service is offline. Please start Ollama.',
        instructions: 'Run: ollama serve'
      }
    });
  }
  
  if (error.code === 'TIMEOUT') {
    return res.status(504).json({
      error: {
        code: 'ANALYSIS_TIMEOUT',
        message: 'Analysis took too long',
        user_message: 'Analysis timed out. Please try again with a clearer image.'
      }
    });
  }
  
  // Generic error
  return res.status(500).json({
    error: {
      code: 'ANALYSIS_FAILED',
      message: error.message,
      user_message: 'AI analysis failed. Please try again.'
    }
  });
}
```

### Response Caching:
**YES - Implement caching to reduce load**

```javascript
const crypto = require('crypto');

function getImageHash(base64Image) {
  return crypto.createHash('sha256')
    .update(base64Image)
    .digest('hex')
    .substring(0, 16);
}

// Before calling Ollama
const imageHash = getImageHash(frames[0]);
const cached = await cache.get(`analysis:${imageHash}`);

if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour
  console.log('✅ Cache hit');
  return cached.data;
}

// After analysis
await cache.set(`analysis:${imageHash}`, {
  data: analysis,
  timestamp: Date.now()
}, 3600); // 1 hour TTL
```

---

## 8. Which Endpoints Need Real AI?

### Priority Levels:

#### **HIGH PRIORITY - Implement Now:**

**1. POST /api/analyze/plant** ⭐ **CRITICAL**
- **Purpose:** Main plant health analysis with sensor fusion
- **Why:** This IS the AI Assistant feature in UtoBloom
- **Input:** frames[], question, context{moisture, temp, species}
- **Output:** Health assessment + recommendations
- **Expected usage:** Every time user activates AI tile
- **Implementation:** Real Ollama integration required

---

#### **MEDIUM PRIORITY - Phase 2:**

**2. POST /api/analyze/detect-issues** 📋 **Nice to Have**
- **Purpose:** Focused pest/disease detection
- **Why:** Can initially use same endpoint as #1 with different prompt focus
- **Approach:** 
  - Option A: Separate endpoint with pest-focused prompt
  - Option B: Use `/api/analyze/plant` with `focus: "issues"` parameter
- **Implementation:** Same Ollama integration, different prompt

---

#### **LOW PRIORITY - Future Enhancements:**

**3. POST /api/analyze/identify-species** 🔍 **Not Critical**
- **Why low priority:** User already selects species during onboarding
- **Potential use:** Verify user's selection or suggest corrections
- **Implementation:** Can add later if users frequently misidentify plants

**4. POST /api/analyze/verify-watering** 💧 **Nice Feature**
- **Purpose:** Compare before/after watering images
- **Why low priority:** Requires user to take 2 photos (friction)
- **Implementation:** Batch analysis with comparison logic

**5. Batch endpoints** 📦 **Not Needed for MVP**
- **Why:** UtoBloom is single-plant focused
- **When to add:** If users request multi-plant monitoring

**6. WebSocket streaming** 🌊 **Not Needed**
- **Why:** Not real-time monitoring, intentional AI requests
- **When to add:** Only if users want live camera analysis (unlikely)

---

### Implementation Recommendation:

**Phase 1 (MVP):**
```
✅ POST /api/analyze/plant
✅ GET /api/status
```

**Phase 2 (After MVP Validation):**
```
POST /api/analyze/detect-issues (reuse #1 with different prompt)
```

**Phase 3 (If User Demand Exists):**
```
POST /api/analyze/identify-species
POST /api/analyze/verify-watering
```

---

## Implementation Plan

### Phase 1: Core AI Integration (Do This First)

**Step 1: Install Dependencies**
```bash
cd utovision-api
npm install node-fetch@2
```

**Step 2: Create Service Files**

Create `services/ollamaService.js`:
```javascript
const fetch = require('node-fetch');

class OllamaService {
  constructor(host = 'http://localhost:11434', model = 'llava:latest') {
    this.host = host;
    this.model = model;
  }

  async analyzeImage(frames, prompt) {
    const cleanFrames = frames.map(f => 
      f.replace(/^data:image\/\w+;base64,/, '')
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
          num_predict: 500
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.host}/api/tags`, {
        timeout: 5000
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

module.exports = OllamaService;
```

Create `services/promptBuilder.js`:
```javascript
function buildPlantHealthPrompt(question, context) {
  const { species, current_moisture, temperature_c } = context;
  
  return `You are an expert plant care specialist analyzing a ${species || 'houseplant'}.

SENSOR READINGS:
- Soil Moisture: ${(current_moisture * 100).toFixed(0)}% (0%=completely dry, 100%=saturated)
- Temperature: ${temperature_c}°C

USER QUESTION: "${question}"

Analyze the plant image(s) and provide a structured response:

1. OVERALL HEALTH: Choose one: Great | Good | Fair | Needs Attention

2. VISUAL SYMPTOMS: List observations (leaf color, texture, pests, etc.)

3. SENSOR CORRELATION: How do visual symptoms correlate with moisture ${(current_moisture * 100).toFixed(0)}% and temperature ${temperature_c}°C?

4. PRIMARY ISSUE: Main problem and severity (none/mild/moderate/high/critical)

5. CARE RECOMMENDATIONS: Top 3 specific actions with priority levels

6. CONFIDENCE: Assessment confidence (0.0 to 1.0)

Be specific and actionable.`;
}

module.exports = { buildPlantHealthPrompt };
```

Create `services/responseParser.js`:
```javascript
function parseOllamaResponse(aiText, context) {
  const healthMatch = aiText.match(/OVERALL HEALTH[:\s]+(Great|Good|Fair|Needs Attention)/i);
  const confidenceMatch = aiText.match(/CONFIDENCE[:\s]+(\d\.\d+)/i);
  
  return {
    success: true,
    timestamp: new Date().toISOString(),
    health_assessment: {
      overall_health: healthMatch ? healthMatch[1] : 'Good',
      confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.75,
      visual_symptoms: extractSymptoms(aiText),
      sensor_correlation: extractCorrelation(aiText),
      raw_ai_response: aiText,
      diagnosis: {
        primary_issue: extractPrimaryIssue(aiText),
        confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.75
      }
    },
    care_recommendations: extractRecommendations(aiText),
    metadata: {
      model_used: process.env.OLLAMA_MODEL || 'llava:latest',
      processing_time_ms: 0,
      is_mock_data: false,
      ai_powered: true
    }
  };
}

function extractSymptoms(text) {
  // Simple extraction - enhance based on actual responses
  const symptomsSection = text.match(/VISUAL SYMPTOMS[:\s]+(.*?)(?=SENSOR CORRELATION|$)/is);
  if (!symptomsSection) return [];
  
  return [{
    symptom: symptomsSection[1].trim().substring(0, 200),
    severity: 'info',
    affected_area: 'Observed in image',
    confidence: 0.85
  }];
}

function extractCorrelation(text) {
  const corrSection = text.match(/SENSOR CORRELATION[:\s]+(.*?)(?=PRIMARY ISSUE|$)/is);
  return corrSection ? corrSection[1].trim() : 'See full analysis';
}

function extractPrimaryIssue(text) {
  const issueSection = text.match(/PRIMARY ISSUE[:\s]+(.*?)(?=CARE RECOMMENDATIONS|$)/is);
  return issueSection ? issueSection[1].trim().split('\n')[0] : 'Analysis complete';
}

function extractRecommendations(text) {
  const recSection = text.match(/CARE RECOMMENDATIONS[:\s]+(.*?)(?=CONFIDENCE|$)/is);
  if (!recSection) return [];
  
  return [{
    action: 'Review AI analysis',
    priority: 'medium',
    details: recSection[1].trim().substring(0, 200),
    estimated_recovery_time: 'Varies'
  }];
}

module.exports = { parseOllamaResponse };
```

**Step 3: Update server.js**
```javascript
const OllamaService = require('./services/ollamaService');
const { buildPlantHealthPrompt } = require('./services/promptBuilder');
const { parseOllamaResponse } = require('./services/responseParser');

const ollama = new OllamaService(
  process.env.OLLAMA_HOST,
  process.env.OLLAMA_MODEL
);

app.post('/api/analyze/plant', validateApiKey, async (req, res) => {
  const startTime = Date.now();
  const { frames, question, context } = req.body;

  if (!frames || !Array.isArray(frames) || frames.length === 0) {
    return res.status(400).json({
      error: {
        code: 'MISSING_REQUIRED_FIELD',
        message: 'Frames array required'
      }
    });
  }

  try {
    const isHealthy = await ollama.checkHealth();
    if (!isHealthy) {
      return res.status(503).json({
        error: {
          code: 'AI_SERVICE_UNAVAILABLE',
          message: 'Ollama not available',
          user_message: 'AI assistant offline. Please try again.'
        }
      });
    }

    const prompt = buildPlantHealthPrompt(question, context);
    const aiResponse = await ollama.analyzeImage(frames, prompt);
    const analysis = parseOllamaResponse(aiResponse, context);
    analysis.metadata.processing_time_ms = Date.now() - startTime;

    console.log(`✅ Analysis complete: ${analysis.health_assessment.overall_health}`);
    res.json(analysis);

  } catch (error) {
    console.error('❌ Analysis failed:', error);
    res.status(500).json({
      error: {
        code: 'ANALYSIS_FAILED',
        message: error.message
      }
    });
  }
});
```

**Step 4: Test**
```bash
# Start Ollama
ollama serve

# Start API
.\start-server.ps1

# Run test
cd ..
.\test-api.ps1
```

---

## Summary

| Question | Answer |
|----------|--------|
| **Model** | llava:latest (already installed, fast, accurate enough) |
| **Accuracy** | Intermediate (common issues, pests, sensor correlation) |
| **Strategy** | Single comprehensive analysis call |
| **Sensors** | YES - Moisture + Temperature correlation critical |
| **Response Time** | 3-10 seconds acceptable with loading spinner |
| **Prompts** | Structured text format with 6-section template |
| **Fallback** | Return error, NO mock data |
| **Endpoints** | Implement /api/analyze/plant first, others later |

**Ready to implement!** 🚀
