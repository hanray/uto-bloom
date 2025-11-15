# Enhanced Ollama Error Testing Script
# This will help capture detailed error information

Write-Host "`n=== DETAILED OLLAMA ERROR TESTING ===" -ForegroundColor Cyan
Write-Host "Testing qwen3-vl:32b with maximum error verbosity`n" -ForegroundColor Cyan

# Stop existing Ollama to get fresh logs
Write-Host "1. Stopping existing Ollama instance..." -ForegroundColor Yellow
taskkill /F /IM ollama.exe 2>&1 | Out-Null
Start-Sleep 2

# Start Ollama with environment variable for verbose logging
Write-Host "2. Starting Ollama with debug logging..." -ForegroundColor Yellow
$env:OLLAMA_DEBUG = "1"
$env:OLLAMA_VERBOSE = "1"

# Start Ollama in foreground to capture output
$ollamaProcess = Start-Process -FilePath "C:\Users\HenDj\AppData\Local\Programs\Ollama\ollama.exe" `
    -ArgumentList "serve" `
    -PassThru `
    -NoNewWindow `
    -RedirectStandardOutput "ollama-stdout.log" `
    -RedirectStandardError "ollama-stderr.log"

Write-Host "   Ollama PID: $($ollamaProcess.Id)" -ForegroundColor Gray
Start-Sleep 5

Write-Host "`n3. Testing qwen3-vl:32b with detailed error capture..." -ForegroundColor Yellow

$body = @{
    model = "qwen3-vl:32b"
    prompt = "Describe this test image"
    images = @("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==")
    stream = $false
    options = @{
        temperature = 0.7
    }
} | ConvertTo-Json -Depth 5

try {
    Write-Host "   Sending request to Ollama..." -ForegroundColor Gray
    $response = Invoke-RestMethod `
        -Uri "http://localhost:11434/api/generate" `
        -Method Post `
        -Body $body `
        -ContentType "application/json" `
        -TimeoutSec 120 `
        -ErrorAction Stop
    
    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5
    
} catch {
    Write-Host "`n❌ ERROR CAUGHT" -ForegroundColor Red
    Write-Host "`nException Details:" -ForegroundColor Yellow
    Write-Host "  Type: $($_.Exception.GetType().FullName)" -ForegroundColor Gray
    Write-Host "  Message: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host "  Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Gray
    
    if ($_.ErrorDetails.Message) {
        Write-Host "`nError Details from API:" -ForegroundColor Yellow
        $errorData = $_.ErrorDetails.Message | ConvertFrom-Json
        $errorData | ConvertTo-Json -Depth 10
    }
    
    Write-Host "`nFull Exception Object:" -ForegroundColor Yellow
    $_ | Format-List * -Force
}

Write-Host "`n4. Checking Ollama logs..." -ForegroundColor Yellow

if (Test-Path "ollama-stdout.log") {
    Write-Host "`nOllama STDOUT:" -ForegroundColor Cyan
    Get-Content "ollama-stdout.log" -ErrorAction SilentlyContinue
}

if (Test-Path "ollama-stderr.log") {
    Write-Host "`nOllama STDERR:" -ForegroundColor Cyan
    Get-Content "ollama-stderr.log" -ErrorAction SilentlyContinue
}

# Check Windows Event Logs for crashes
Write-Host "`n5. Checking Windows Event Log for crashes..." -ForegroundColor Yellow
$events = Get-EventLog -LogName Application -Source "Application Error" -Newest 5 -ErrorAction SilentlyContinue | 
    Where-Object { $_.Message -match "ollama" }

if ($events) {
    Write-Host "Found crash events:" -ForegroundColor Red
    $events | Format-List TimeGenerated, Message
} else {
    Write-Host "No crash events found in Application log" -ForegroundColor Gray
}

Write-Host "`n6. Checking Ollama process status..." -ForegroundColor Yellow
$stillRunning = Get-Process -Id $ollamaProcess.Id -ErrorAction SilentlyContinue
if ($stillRunning) {
    Write-Host "   Ollama is still running (PID: $($ollamaProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "   Ollama process has terminated!" -ForegroundColor Red
    Write-Host "   Exit Code: $($ollamaProcess.ExitCode)" -ForegroundColor Red
}

Write-Host "`n=== END OF ERROR TESTING ===" -ForegroundColor Cyan
Write-Host "`nLog files created:" -ForegroundColor Yellow
Write-Host "  - ollama-stdout.log" -ForegroundColor Gray
Write-Host "  - ollama-stderr.log" -ForegroundColor Gray
Write-Host "`nPress any key to stop Ollama and exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

taskkill /F /IM ollama.exe 2>&1 | Out-Null
