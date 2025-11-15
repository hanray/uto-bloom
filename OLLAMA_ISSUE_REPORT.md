# Ollama qwen3-vl Model Crash Report

**Date:** November 15, 2025  
**System:** Windows, 92GB Available RAM, RTX 3090 GPU, i9 CPU  
**Ollama Version:** Latest (as of Nov 15, 2025)

---

## Problem Summary

All qwen3-vl model variants crash immediately with "model runner has unexpectedly stopped" error, even the smallest 6.1GB variant. This occurs on a system with 92GB available RAM. **Every other vision model (llava:latest) works perfectly.**

---

## System Specifications

- **Available RAM:** 92.7 GB
- **GPU:** NVIDIA RTX 3090 (24GB VRAM)
- **CPU:** Intel i9 (24 threads available)
- **OS:** Windows
- **Working Models:** llava:latest (4.7GB) - works flawlessly
- **Failing Models:** ALL qwen3-vl variants

---

## Models Tested

### ✅ Working Models
- **llava:latest** (4.7GB) - No issues, fast, reliable

### ❌ Failing Models (ALL crash with same error)
1. **qwen3-vl:235b** (143GB)
   - Initial target model
   - Error: "model requires more system memory (105.9 GiB) than is available (92.7 GiB)"
   - Expected to fail due to size - this makes sense

2. **qwen3-vl:32b** (21GB)  
   - Pulled successfully
   - Crashes on inference: "model runner has unexpectedly stopped"
   - Should easily fit in 92GB RAM

3. **qwen3-vl:8b** (6.1GB)
   - Pulled successfully  
   - Crashes on inference: "model runner has unexpectedly stopped"
   - **This is only 6.1GB - should definitely work!**

---

## Error Messages

### For qwen3-vl:235b
```
ResponseError: model requires more system memory (105.9 GiB) than is available (92.7 GiB)
```
*This error makes sense - model is too large*

### For qwen3-vl:32b and qwen3-vl:8b
```json
{
  "error": "model runner has unexpectedly stopped, this may be due to resource limitations or an internal error, check ollama server logs for details"
}
```
*This doesn't make sense - 6.1GB should work fine with 92GB RAM*

---

## Memory Optimization Techniques Attempted

### 1. GPU Layer Reduction
```javascript
options: {
  num_gpu: 10,        // Reduced from default
  num_ctx: 2048,
  temperature: 0.7
}
```

### 2. CPU-Only Mode
```javascript
options: {
  num_gpu: 0,         // Force CPU-only
  num_thread: 24,     // Use all CPU cores
  num_ctx: 1024,      // Minimal context
  num_batch: 128
}
```

### 3. Minimal Configuration
```javascript
// Let Ollama auto-detect optimal settings
options: {
  temperature: 0.7
}
```

### 4. Environment Variables
```bash
OLLAMA_NUM_GPU=0
OLLAMA_LLM_LIBRARY=cpu
OLLAMA_NUM_CTX=1024
OLLAMA_MAX_LOADED_MODELS=1
```

### 5. Ollama Process Restart
- Killed and restarted Ollama between each test
- Fresh Ollama instance for each model attempt
- Cleared all loaded models

**None of these approaches worked for any qwen3-vl variant.**

---

## API Structure & Use Case

### Our Application
Plant health monitoring system using camera-based AI analysis.

### API Endpoint Structure
```javascript
POST /api/analyze/plant
{
  "frames": ["base64-image1", "base64-image2"],  // 2 frames, ~300px width, JPEG 30% quality
  "question": "Does my plant look healthy and well today?",
  "context": {
    "plant_id": "pot-01",
    "species": "monstera",
    "sensor_data": { "soil_moisture_raw": 512 }
  }
}
```

### Ollama Integration Code
```javascript
const { Ollama } = require('ollama');
const ollama = new Ollama({ host: 'http://localhost:11434' });

const response = await ollama.generate({
  model: 'qwen3-vl:8b',
  prompt: buildPlantAnalysisPrompt(question, context),
  images: cleanedFrames,  // Array of base64 strings (no prefix)
  stream: false,
  options: {
    temperature: 0.7
  }
});
```

### Request Details
- **Image count:** 2 frames per request
- **Image size:** ~300x225px each
- **Image quality:** JPEG at 30% compression
- **Total payload:** ~40-60KB per request
- **Frequency:** Every 30 seconds (when active)

---

## Test Results

### Direct Ollama API Test
```powershell
# Test command
$body = @{
    model = "qwen3-vl:8b"
    prompt = "Test"
    images = @("iVBORw0KGg...") # 1x1 pixel test image
    stream = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -Body $body
```

**Result:** Same crash - "model runner has unexpectedly stopped"

### llava:latest Test (Control)
```powershell
# Same test with llava:latest
$body.model = "llava:latest"
Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -Body $body
```

**Result:** ✅ Works perfectly, returns analysis in ~3-5 seconds

---

## Timeline of Attempts

1. Started with qwen3-vl:235b → Too large for RAM *(expected)*
2. Tried CPU-only mode with 235b → Still too large *(expected)*
3. Discovered smaller variants exist
4. Pulled qwen3-vl:32b → Crashes on inference *(unexpected)*
5. Reduced GPU layers (35 → 10 → 0) → Still crashes
6. Pulled qwen3-vl:8b → Crashes on inference *(very unexpected)*
7. Tested with minimal 1x1 pixel image → Still crashes
8. Restarted Ollama fresh → Still crashes
9. Reverted to llava:latest → Works immediately

---

## What's Confusing

1. **qwen3-vl:8b is only 6.1GB** - Should easily fit in 92GB RAM with 85GB to spare
2. **llava:latest (4.7GB) works perfectly** - Uses similar vision architecture
3. **Error occurs immediately** - Not a gradual memory issue, instant crash
4. **All variants fail identically** - 8b, 32b, 235b all crash the same way (except 235b with different OOM error)
5. **No other model has ever done this** - llava, gpt-oss:20b all work fine

---

## Questions for Ollama Team

1. **Why does qwen3-vl:8b (6.1GB) crash with "model runner unexpectedly stopped" when 92GB RAM is available?**
   - Is there a minimum RAM requirement beyond model size?
   - Are there specific system dependencies qwen3-vl needs?

2. **Why does this only happen with qwen3-vl models?**
   - llava:latest works perfectly
   - gpt-oss:20b works fine
   - Is there something unique about qwen3-vl's architecture?

3. **What does "model runner has unexpectedly stopped" actually mean?**
   - How can we get more detailed error logs?
   - Where are the Ollama server logs located on Windows?
   - Is there a verbose/debug mode we can enable?

4. **Are there known compatibility issues with qwen3-vl on Windows?**
   - RTX 3090 GPU compatibility?
   - Windows-specific issues?
   - CUDA version requirements?

5. **What is the actual memory footprint of qwen3-vl:8b at runtime?**
   - Model file: 6.1GB
   - Runtime memory needed: ???
   - VRAM requirements: ???

6. **Can we force CPU-only execution for qwen3-vl?**
   - Setting `num_gpu=0` doesn't help
   - Setting `OLLAMA_LLM_LIBRARY=cpu` doesn't help
   - Is there another way?

7. **Is there a way to get crash dumps or detailed error logs?**
   - The error message is vague
   - Need to understand root cause
   - Happy to provide any diagnostics needed

8. **Are there alternative qwen vision models that might work?**
   - qwen2-vl variants?
   - Different quantizations?
   - Community fine-tunes?

---

## Additional Context

- **This is blocking our production deployment** - We specifically want qwen3-vl for better plant analysis quality
- **llava works but is our fallback** - Would prefer qwen3-vl's superior vision capabilities
- **Willing to help debug** - Can provide logs, run tests, try patches
- **System is not the limiting factor** - 92GB RAM, 24GB VRAM, plenty of resources available

---

## System Information

```
Ollama Models Installed:
- llava:latest (4.7GB) ✅ Working
- qwen3-vl:8b (6.1GB) ❌ Crashes
- qwen3-vl:32b (20GB) ❌ Crashes  
- qwen3-vl:235b (143GB) ❌ OOM (expected)
- gpt-oss:20b (12.8GB) ✅ Working

Available Resources:
- RAM: 92.7GB available
- VRAM: 24GB (RTX 3090)
- CPU: Intel i9, 24 threads
```

---

## Request for Help

We'd greatly appreciate any insights into:
1. Why even the smallest qwen3-vl variant fails
2. How to get detailed crash logs
3. Whether this is a known issue
4. Any workarounds or configuration changes we should try
5. Alternative approaches to get qwen3-vl working

Thank you for your help!
