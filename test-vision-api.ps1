# Test UtoVision API
# This script sends a test request to the API and displays the response

Write-Host ""
Write-Host "🧪 Testing UtoVision API..." -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Authorization" = "Bearer sk_dev_utobloom_2025"
    "Content-Type" = "application/json"
}

$body = @{
    image = "data:image/jpeg;base64,test_image_data_here"
    context = @{
        plant_id = "pot-01"
        species = "monstera"
        current_moisture = 0.45
        temperature_c = 22.5
        humidity_percent = 50
        light_lux = 12000
    }
    options = @{
        include_care_recommendations = $true
    }
} | ConvertTo-Json -Depth 3

try {
    Write-Host "📡 Sending request to http://localhost:3001/api/analyze/plant" -ForegroundColor Yellow
    Write-Host ""
    
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/analyze/plant" `
                                  -Method Post `
                                  -Headers $headers `
                                  -Body $body
    
    Write-Host "✅ API Response Received!" -ForegroundColor Green
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  Health Assessment" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Overall Health: " -NoNewline -ForegroundColor White
    Write-Host $response.health_assessment.overall_health -ForegroundColor Green
    Write-Host "  Confidence: " -NoNewline -ForegroundColor White
    Write-Host "$([math]::Round($response.health_assessment.confidence * 100))%" -ForegroundColor Yellow
    
    if ($response.health_assessment.diagnosis.primary_issue) {
        Write-Host "  Primary Issue: " -NoNewline -ForegroundColor White
        Write-Host $response.health_assessment.diagnosis.primary_issue -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  Care Recommendations" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($rec in $response.care_recommendations) {
        $color = switch ($rec.priority) {
            "critical" { "Red" }
            "high" { "Yellow" }
            "medium" { "Cyan" }
            default { "Green" }
        }
        Write-Host "  [$($rec.priority.ToUpper())]" -ForegroundColor $color -NoNewline
        Write-Host " $($rec.action)" -ForegroundColor White
        Write-Host "      $($rec.details)" -ForegroundColor Gray
        Write-Host ""
    }
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  Metadata" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Model: $($response.metadata.model_used)" -ForegroundColor Gray
    Write-Host "  Processing Time: $($response.metadata.processing_time_ms)ms" -ForegroundColor Gray
    Write-Host "  Sensor Data Used: $($response.metadata.sensor_data_used)" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host "❌ API Test Failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure UtoVision API is running on port 3001" -ForegroundColor Yellow
    Write-Host "Run: cd utovision-api then npm start" -ForegroundColor Yellow
    Write-Host ""
}
