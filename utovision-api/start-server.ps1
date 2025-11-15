# Start UtoVision API Server
# This script ensures clean startup by killing existing processes

Write-Host ""
Write-Host "🔄 Starting UtoVision API Server..." -ForegroundColor Cyan
Write-Host ""

# Kill any existing node processes
Write-Host "Checking for existing node processes..." -ForegroundColor Yellow
$existingProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($existingProcesses) {
    Write-Host "Found $($existingProcesses.Count) node process(es). Stopping..." -ForegroundColor Yellow
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "✓ Stopped existing processes" -ForegroundColor Green
} else {
    Write-Host "✓ No existing processes found" -ForegroundColor Green
}

# Check if port 3001 is in use
Write-Host "Checking port 3001..." -ForegroundColor Yellow
$portCheck = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($portCheck) {
    Write-Host "Port 3001 is in use by process $($portCheck.OwningProcess). Killing..." -ForegroundColor Yellow
    Stop-Process -Id $portCheck.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "✓ Port 3001 freed" -ForegroundColor Green
} else {
    Write-Host "✓ Port 3001 is available" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting server in new window..." -ForegroundColor Cyan

# Start server in new PowerShell window that stays open
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; node server.js"

Write-Host ""
Write-Host "✓ Server started in new window!" -ForegroundColor Green
Write-Host ""
Write-Host "Server should be running at: http://localhost:3001" -ForegroundColor Cyan
Write-Host "API Key: sk_dev_utobloom_2025" -ForegroundColor Yellow
Write-Host ""
Write-Host "Run tests with: cd .. ; .\test-api.ps1" -ForegroundColor Gray
Write-Host ""
