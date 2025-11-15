Write-Host "Stopping existing Ollama..." -ForegroundColor Yellow
taskkill /F /IM ollama.exe 2>&1 | Out-Null
Start-Sleep 2

Write-Host "Starting Ollama in CPU-only mode for qwen3-vl..." -ForegroundColor Cyan
$env:OLLAMA_NUM_GPU = "0"
$env:OLLAMA_LLM_LIBRARY = "cpu"
$env:OLLAMA_NUM_CTX = "1024"
$env:OLLAMA_MAX_LOADED_MODELS = "1"

& "C:\Users\HenDj\AppData\Local\Programs\Ollama\ollama.exe" serve

Write-Host "Ollama stopped" -ForegroundColor Gray
