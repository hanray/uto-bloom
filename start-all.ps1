# Start All UtoBloom Services with Hot Reload
# This script starts all services in parallel using background jobs
# Services:
# 1. UtoBloom Server (port 3000)
# 2. Serial Bridge (COM5)
# 3. React Client (port 5174)
# 4. UtoVision API (port 3001) with nodemon hot reload

Write-Host ""
Write-Host "=========================================="  -ForegroundColor Cyan
Write-Host "   Uto Bloom - Starting All Services"  -ForegroundColor Cyan
Write-Host "=========================================="  -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting services in parallel:" -ForegroundColor Yellow
Write-Host "  🟢 Express Server (port 3000)" -ForegroundColor Green
Write-Host "  🔌 Serial Bridge (COM5)" -ForegroundColor Green
Write-Host "  ⚛️  React Client (port 5174)" -ForegroundColor Green
Write-Host "  🤖 UtoVision API (port 3001) [HOT RELOAD]" -ForegroundColor Magenta
Write-Host ""

# Kill any existing node/vite processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Start UtoBloom main services (runs concurrently: server, serial, client)
Write-Host "🚀 Starting UtoBloom services..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\E\Creative Work\Backend Dev\UtoBloom'; npm start" -WindowStyle Normal

# Wait for main services to initialize
Start-Sleep -Seconds 3

# Start UtoVision API with hot reload
Write-Host "🤖 Starting UtoVision API with nodemon..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\E\Creative Work\Backend Dev\UtoBloom\utovision-api'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "📡 Endpoints:" -ForegroundColor Yellow
Write-Host "   UtoBloom Server:  http://localhost:3000" -ForegroundColor White
Write-Host "   React Client:     http://localhost:5174" -ForegroundColor White
Write-Host "   UtoVision API:    http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "💡 UtoVision API has hot reload - file changes auto-restart!" -ForegroundColor Cyan
Write-Host "💡 Check each PowerShell window for service logs" -ForegroundColor Yellow
Write-Host ""
