@echo off
echo.
echo ==========================================
echo    Uto Bloom - Starting All Services
echo ==========================================
echo.

REM Configure Ollama for GPU+CPU hybrid (Qwen3-VL optimization for RTX 3090 + i9)
echo Configuring Ollama for efficient large model inference...
set OLLAMA_NUM_GPU=25
set OLLAMA_NUM_THREAD=14
set OLLAMA_MAX_LOADED_MODELS=1
set OLLAMA_FLASH_ATTENTION=1
set OLLAMA_NUM_PARALLEL=1
echo   Ollama: GPU layers=25, CPU threads=14, Flash Attention=ON
echo   Note: GPU+CPU hybrid mode (removed LLM_LIBRARY=cpu to enable GPU)
echo.

REM Stop existing Ollama process
taskkill /F /IM ollama.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Start Ollama with optimized settings
echo Starting Ollama service...
start /B "" "C:\Users\HenDj\AppData\Local\Programs\Ollama\ollama.exe" serve
timeout /t 5 /nobreak >nul
echo   Ollama: Ready (optimized for Qwen3-VL on RTX 3090)
echo.

echo Starting Application Services:
echo   - Express Server (port 3000)
echo   - Serial Bridge (COM5)
echo   - React Client (port 5173)
echo   - UtoVision API (port 3001)
echo.
echo Press Ctrl+C to stop all services
echo.

npm.cmd start
