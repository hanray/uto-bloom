# Verbose API Test - Shows Full Request and Response
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  UtoVision API - Verbose Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Authorization" = "Bearer sk_dev_utobloom_2025"
    "Content-Type" = "application/json"
}

# Test different scenarios
$scenarios = @(
    @{
        name = "Healthy Plant"
        moisture = 0.45
        temp = 22.5
        light = 12000
    },
    @{
        name = "Needs Water (Dry)"
        moisture = 0.20
        temp = 22.5
        light = 12000
    },
    @{
        name = "Overwatered"
        moisture = 0.90
        temp = 22.5
        light = 12000
    },
    @{
        name = "Too Cold"
        moisture = 0.45
        temp = 12
        light = 12000
    },
    @{
        name = "Too Hot"
        moisture = 0.45
        temp = 35
        light = 12000
    },
    @{
        name = "Low Light"
        moisture = 0.45
        temp = 22.5
        light = 3000
    }
)

foreach ($scenario in $scenarios) {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
    Write-Host "  Testing: $($scenario.name)" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
    Write-Host ""
    
    $testData = @{
        image = "data:image/jpeg;base64,test_image_data_12345"
        context = @{
            plant_id = "pot-01"
            species = "monstera"
            current_moisture = $scenario.moisture
            temperature_c = $scenario.temp
            humidity_percent = 50
            light_lux = $scenario.light
            last_watered = "2025-11-14T08:00:00Z"
            health_status = "unknown"
        }
        options = @{
            include_care_recommendations = $true
        }
    }
    
    Write-Host "REQUEST PAYLOAD:" -ForegroundColor Cyan
    Write-Host "  Plant ID: pot-01" -ForegroundColor Gray
    Write-Host "  Species: monstera" -ForegroundColor Gray
    Write-Host "  Moisture: $($scenario.moisture * 100)%" -ForegroundColor Gray
    Write-Host "  Temperature: $($scenario.temp)°C" -ForegroundColor Gray
    Write-Host "  Light: $($scenario.light) lux" -ForegroundColor Gray
    Write-Host "  Image: test_image_data_12345 (base64)" -ForegroundColor Gray
    Write-Host ""
    
    $body = $testData | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3001/api/analyze/plant" -Method Post -Headers $headers -Body $body
        
        Write-Host "RESPONSE:" -ForegroundColor Green
        Write-Host ""
        Write-Host "Health Assessment:" -ForegroundColor Cyan
        Write-Host "  Overall Health: $($response.health_assessment.overall_health)" -ForegroundColor White
        Write-Host "  Confidence: $([math]::Round($response.health_assessment.confidence * 100))%" -ForegroundColor White
        
        if ($response.health_assessment.diagnosis.primary_issue) {
            Write-Host "  Primary Issue: $($response.health_assessment.diagnosis.primary_issue)" -ForegroundColor Red
        } else {
            Write-Host "  Primary Issue: None" -ForegroundColor Green
        }
        
        if ($response.health_assessment.visual_symptoms.Count -gt 0) {
            Write-Host ""
            Write-Host "Visual Symptoms:" -ForegroundColor Cyan
            foreach ($symptom in $response.health_assessment.visual_symptoms) {
                Write-Host "  - $($symptom.symptom) [$($symptom.severity)]" -ForegroundColor Yellow
                Write-Host "    Area: $($symptom.affected_area)" -ForegroundColor Gray
                Write-Host "    Confidence: $([math]::Round($symptom.confidence * 100))%" -ForegroundColor Gray
            }
        }
        
        Write-Host ""
        Write-Host "Care Recommendations:" -ForegroundColor Cyan
        foreach ($rec in $response.care_recommendations) {
            $priorityColor = switch ($rec.priority) {
                "critical" { "Red" }
                "high" { "Yellow" }
                "medium" { "Cyan" }
                default { "Green" }
            }
            Write-Host "  [$($rec.priority.ToUpper())]" -ForegroundColor $priorityColor -NoNewline
            Write-Host " $($rec.action)" -ForegroundColor White
            Write-Host "    → $($rec.details)" -ForegroundColor Gray
            Write-Host "    Recovery Time: $($rec.estimated_recovery_time)" -ForegroundColor DarkGray
        }
        
        Write-Host ""
        Write-Host "Metadata:" -ForegroundColor Cyan
        Write-Host "  Model: $($response.metadata.model_used)" -ForegroundColor Gray
        Write-Host "  Processing Time: $($response.metadata.processing_time_ms)ms" -ForegroundColor Gray
        Write-Host "  Sensor Data Used: $($response.metadata.sensor_data_used)" -ForegroundColor Gray
        Write-Host "  Image Analyzed: $($response.metadata.image_analyzed)" -ForegroundColor Gray
        
    } catch {
        Write-Host "ERROR!" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
