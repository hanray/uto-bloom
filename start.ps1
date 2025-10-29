Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Uto Bloom - Starting All Services" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting:" -ForegroundColor Yellow
Write-Host "  - Express Server (port 3000)" -ForegroundColor Green
Write-Host "  - Serial Bridge (COM5)" -ForegroundColor Green
Write-Host "  - React Client (port 5173)" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Gray
Write-Host ""

npm.cmd start
