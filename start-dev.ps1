# Start All UtoBloom Services - Single Terminal with Hot Reload
# Uses concurrently to run all services in one window

Write-Host ""
Write-Host "=========================================="  -ForegroundColor Cyan
Write-Host "   Uto Bloom - Development Mode"  -ForegroundColor Cyan
Write-Host "=========================================="  -ForegroundColor Cyan
Write-Host ""

# Check if concurrently is installed
$hasRootPackageJson = Test-Path "package.json"
if (-not $hasRootPackageJson) {
    Write-Host "❌ No package.json found in root!" -ForegroundColor Red
    Write-Host "Creating package.json with concurrently..." -ForegroundColor Yellow
    
    @"
{
  "name": "utobloom-workspace",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently -n \"SERVER,SERIAL,CLIENT,VISION\" -c \"green,blue,cyan,magenta\" \"npm --prefix server start\" \"npm --prefix scripts run serial\" \"npm --prefix client run dev\" \"npm --prefix utovision-api run dev\"",
    "start:all": "npm run dev"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
"@ | Out-File -FilePath "package.json" -Encoding UTF8
    
    Write-Host "Installing concurrently..." -ForegroundColor Yellow
    npm install
}

Write-Host "🚀 Starting all services with hot reload..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Services:" -ForegroundColor Yellow
Write-Host "  🟢 EXPRESS  - UtoBloom Server (port 3000)" -ForegroundColor Green
Write-Host "  🔌 SERIAL   - Serial Bridge (COM5)" -ForegroundColor Blue
Write-Host "  ⚛️  CLIENT   - React App (port 5174)" -ForegroundColor Cyan
Write-Host "  🤖 VISION   - UtoVision API (port 3001)" -ForegroundColor Magenta
Write-Host ""
Write-Host "💡 All services have hot reload enabled!" -ForegroundColor Green
Write-Host "💡 Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Run all services
npm run dev
