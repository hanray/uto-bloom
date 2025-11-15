$body = @{
    frames = @("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==")
    question = "How is this plant?"
    context = @{ species = "test" }
} | ConvertTo-Json

try {
    Write-Host "Testing API..." -ForegroundColor Cyan
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/analyze/plant" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer sk_dev_utobloom_2025"
            "Content-Type" = "application/json"
        } `
        -Body $body `
        -TimeoutSec 120
    
    Write-Host "Success!" -ForegroundColor Green
    $result | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "`nDetailed Error Response:" -ForegroundColor Yellow
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        $errorDetails | ConvertTo-Json -Depth 10
    }
    
    Write-Host "`nFull Exception:" -ForegroundColor Yellow
    $_ | Format-List * -Force
}
