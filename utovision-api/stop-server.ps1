# Stop UtoVision API Server

Write-Host ""
Write-Host "🛑 Stopping UtoVision API Server..." -ForegroundColor Cyan
Write-Host ""

# Kill all node processes
$processes = Get-Process -Name node -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "Found $($processes.Count) node process(es). Stopping..." -ForegroundColor Yellow
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    Write-Host "✓ All node processes stopped" -ForegroundColor Green
} else {
    Write-Host "✓ No node processes running" -ForegroundColor Green
}

Write-Host ""
