# Test UtoVision API
Write-Host ""
Write-Host "Testing UtoVision API..." -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Authorization" = "Bearer sk_dev_utobloom_2025"
    "Content-Type" = "application/json"
}

$testData = @{
    frames = @("data:image/jpeg;base64,test_image_data")
    question = "Does my plant look healthy and well today?"
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
}

$body = $testData | ConvertTo-Json -Depth 3

try {
    Write-Host "Sending request to http://localhost:3001/api/analyze/plant" -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/analyze/plant" -Method Post -Headers $headers -Body $body
    
    Write-Host ""
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Health: $($response.health_assessment.overall_health)" -ForegroundColor Green
    Write-Host "Confidence: $([math]::Round($response.health_assessment.confidence * 100))%" -ForegroundColor Yellow
    
    if ($response.health_assessment.diagnosis.primary_issue) {
        Write-Host "Issue: $($response.health_assessment.diagnosis.primary_issue)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Recommendations:" -ForegroundColor Cyan
    foreach ($rec in $response.care_recommendations) {
        Write-Host "  - [$($rec.priority)] $($rec.action)" -ForegroundColor White
        Write-Host "    $($rec.details)" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "Model: $($response.metadata.model_used)" -ForegroundColor Gray
    Write-Host "Processing Time: $($response.metadata.processing_time_ms)ms" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure UtoVision API is running:" -ForegroundColor Yellow
    Write-Host "  cd utovision-api" -ForegroundColor Yellow
    Write-Host "  npm start" -ForegroundColor Yellow
    Write-Host ""
}
