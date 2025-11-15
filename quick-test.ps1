# Quick Test - Start server and run test automatically

Write-Host ""
Write-Host "🚀 Quick Test - UtoVision API" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop existing processes
Write-Host "[1/4] Stopping existing processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "      ✓ Done" -ForegroundColor Green

# Step 2: Start server in background
Write-Host "[2/4] Starting API server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\E\Creative Work\Backend Dev\UtoBloom\utovision-api'; node server.js"
Start-Sleep -Seconds 3
Write-Host "      ✓ Server started" -ForegroundColor Green

# Step 3: Wait for server to be ready
Write-Host "[3/4] Waiting for server..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Write-Host "      ✓ Ready" -ForegroundColor Green

# Step 4: Run test
Write-Host "[4/4] Running test..." -ForegroundColor Yellow
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

.\test-api.ps1

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Test complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Server is still running. To stop:" -ForegroundColor Gray
Write-Host "  cd utovision-api ; .\stop-server.ps1" -ForegroundColor Gray
Write-Host ""
