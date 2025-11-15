# UtoVision AI API Integration - Questions for External API Team

## Understanding the External AI API

We're building an **adapter service** (`utovision-api` on port 3001) that sits between UtoBloom client and your external AI API with Ollama integration. Before we can complete the integration, we need clarity on your API's specifications.

---

## ❓ Critical Questions About Your API

### 1. **API Location & Access**
- [ ] What is the base URL of your AI API?
  - Is it running locally? (e.g., `http://localhost:3000`)
  - Is it on a remote server? (e.g., `https://api.utovision.com`)
  - Different port on same machine?

### 2. **Authentication**
- [ ] How do we authenticate requests to your API?
  - Bearer token in Authorization header?
  - API key in a custom header?
  - What is the current API key we should use?

### 3. **Request Format - Plant Health Analysis**
According to docs, you expect this format. **Is this still accurate?**

```javascript
POST /api/analyze/plant
Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json

Body:
{
  "image": "base64-encoded-image",  // Single image or multiple?
  "context": {
    "plant_id": "pot-01",
    "species": "monstera",
    "current_moisture": 0.45,       // Do you need this?
    "temperature_c": 22.5,          // Or just visual analysis?
    "humidity_percent": 47,
    "light_lux": 12000,
    "last_watered": "2025-11-14T08:00:00Z",
    "health_status": "great"
  },
  "options": {
    "include_care_recommendations": true
  }
}
```

**Questions:**
- [ ] Do you want `image` (singular) or `frames` (array of 3 images)?
- [ ] Do you need sensor data (moisture, temp, light) or just the image?
- [ ] Is the image format `base64` with or without the `data:image/jpeg;base64,` prefix?
- [ ] What should we send in the `question` field? Or is there no question field?

### 4. **Response Format**
According to docs, you return this. **Is this correct?**

```javascript
{
  "success": true,
  "timestamp": "2025-11-15T...",
  "health_assessment": {
    "overall_health": "Great" | "Good" | "Fair" | "Needs Attention",
    "confidence": 0.85,
    "visual_symptoms": [
      {
        "symptom": "string",
        "severity": "critical" | "high" | "moderate" | "mild",
        "affected_area": "string",
        "confidence": 0.85
      }
    ],
    "diagnosis": {
      "primary_issue": "string",
      "contributing_factors": [],
      "confidence": 0.82
    }
  },
  "care_recommendations": [
    {
      "action": "string",
      "priority": "critical" | "high" | "medium" | "low",
      "details": "string",
      "estimated_recovery_time": "string"
    }
  ],
  "metadata": {
    "model_used": "llava:latest",
    "processing_time_ms": 1500,
    "ai_powered": true
  }
}
```

**Questions:**
- [ ] Is this the actual response structure from your API?
- [ ] Any additional fields we need to handle?
- [ ] How do you indicate errors? (e.g., Ollama offline)

### 5. **Error Handling**
- [ ] What HTTP status codes do you return for errors?
  - 503 when Ollama is offline?
  - 500 for internal errors?
  - 400 for bad requests?
- [ ] What is the error response format?
  ```javascript
  {
    "error": {
      "code": "string",
      "message": "string",
      "user_message": "string"  // Friendly message for UI?
    }
  }
  ```

### 6. **Other Endpoints**
Do these endpoints exist on your API?

- [ ] `POST /api/plant/ask` - Q&A without image?
- [ ] `POST /api/analyze/detect-issues` - Issue detection?
- [ ] `GET /api/status` - Health check / Ollama status?
- [ ] `WebSocket /api/stream` - Streaming analysis?

If yes, what are their request/response formats?

### 7. **Rate Limits & Constraints**
- [ ] Do you have rate limits we need to respect?
- [ ] Maximum image size allowed?
- [ ] Timeout duration for responses?
- [ ] Concurrent request limits?

### 8. **Models & Configuration**
- [ ] Which Ollama model are you using? (`llava:latest`, `qwen3-vl:235b`, other?)
- [ ] Can we specify the model in requests or is it fixed?
- [ ] Are there different models for different operations?

---

## 🎯 What We're Building (Our Adapter)

**UtoBloom Client → Our Adapter (port 3001) → Your AI API**

### Our Current Adapter Sends:
```javascript
POST http://localhost:3001/api/analyze/plant
{
  "frames": ["base64-frame1", "base64-frame2", "base64-frame3"],
  "question": "Does my plant look healthy and well today?",
  "context": {
    "plant_id": "pot-01",
    "species": "monstera"
  },
  "options": {
    "include_care_recommendations": true,
    "analysis_type": "visual_inspection"
  }
}
```

### We Need to Transform This To:
**→ Whatever format YOUR API expects**

---

## 📋 Action Items for Integration

Once you answer the questions above, we will:

1. ✅ Update our adapter to forward requests in YOUR expected format
2. ✅ Transform your responses to match what UtoBloom client expects
3. ✅ Handle errors gracefully (Ollama offline, timeouts, etc.)
4. ✅ Add proper logging for debugging
5. ✅ Test end-to-end flow

---

## 🔍 Testing Plan

After integration, we'll test:
- ✅ Camera captures 3 frames → adapter receives them
- ✅ Adapter transforms & forwards to your API
- ✅ Your API analyzes with Ollama → returns response
- ✅ Adapter transforms response back to client format
- ✅ UI displays AI analysis correctly
- ✅ Error scenarios (Ollama offline, network issues, etc.)

- ✅ Error scenarios (Ollama offline, network issues, etc.)

---

## 📝 Current Status

**What's Working:**
- ✅ UtoBloom client captures camera frames (3 snapshots @ 400px, 50% quality)
- ✅ Client sends to our adapter at `http://localhost:3001/api/analyze/plant`
- ✅ Adapter has mock responses for UI testing
- ✅ Hot reload enabled (nodemon) for rapid development

**What's Needed:**
- ❌ Connection to your external AI API (waiting for specs above)
- ❌ Request/response transformation logic
- ❌ Error handling for AI-specific failures

**Services Running:**
- Port 3000: UtoBloom main server
- Port 5173: Vite dev client  
- Port 3001: Our adapter (currently mock, needs your API integration)
- Port ?: Your AI API with Ollama (unknown location)

---

## 💡 Example: How Adapter Will Work

```javascript
// utovision-api/server.js (our adapter)

app.post('/api/analyze/plant', async (req, res) => {
  const { frames, question, context } = req.body;
  
  try {
    // Transform our format → your API format
    const externalRequest = {
      image: frames[0], // or all 3 frames?
      context: {
        plant_id: context.plant_id,
        species: context.species,
        // include sensor data? moisture, temp, light?
      },
      options: {
        include_care_recommendations: true
      }
    };
    
    // Forward to YOUR AI API
    const aiResponse = await fetch('YOUR_API_URL/api/analyze/plant', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(externalRequest)
    });
    
    const aiResult = await aiResponse.json();
    
    // Return to UtoBloom client (maybe transform if needed)
    res.json(aiResult);
    
  } catch (error) {
    // Handle Ollama offline, network errors, etc.
    res.status(503).json({
      error: {
        code: 'AI_UNAVAILABLE',
        message: 'AI service temporarily unavailable'
      }
    });
  }
});
