$body = @{
    model = "qwen3-vl:32b"
    prompt = "Test"
    images = @("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==")
    stream = $false
} | ConvertTo-Json

try {
    Write-Host "Testing Ollama directly with qwen3-vl:32b..." -ForegroundColor Cyan
    $result = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 120
    Write-Host "Success!" -ForegroundColor Green
    $result | ConvertTo-Json
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}
