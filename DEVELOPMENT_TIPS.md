# Development Tips & Troubleshooting

Quick reference for common development tasks and issues.

## Starting Services

### Option 1: Quick Test (Recommended for Testing)
```powershell
.\quick-test.ps1
```
- Stops existing processes
- Starts server
- Runs tests automatically
- Server stays running after test

### Option 2: Start Services Manually

**UtoVision API:**
```powershell
cd utovision-api
.\start-server.ps1
```

**UtoBloom Main App:**
```powershell
.\start.ps1
# Or: .\start.bat
```

## Common Issues & Solutions

### 1. Port Already in Use (EADDRINUSE)

**Problem:** Server can't start because port is occupied.

**Solution:**
```powershell
# For UtoVision API (port 3001)
cd utovision-api
.\stop-server.ps1

# For all node processes
Get-Process -Name node | Stop-Process -Force
```

### 2. Server Exits Immediately

**Problem:** Server starts then exits when running via `npm start` or `node server.js`.

**Solution:** Use the provided scripts that open persistent windows:
```powershell
cd utovision-api
.\start-server.ps1
```

Or manually start in new window:
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'path\to\utovision-api'; node server.js"
```

### 3. Test Fails with "Unable to connect"

**Problem:** Test can't reach the API server.

**Checklist:**
1. Is server running?
   ```powershell
   Get-Process -Name node
   ```
2. Is port 3001 listening?
   ```powershell
   Get-NetTCPConnection -LocalPort 3001
   ```
3. Wait 3-5 seconds after starting server before testing
4. Check server window for error messages

**Solution:**
```powershell
.\quick-test.ps1  # Handles everything automatically
```

### 4. Test Fails with 400 Bad Request

**Problem:** Server rejects the request payload.

**Common Causes:**
- Missing `frames` array in request body
- Missing `Authorization` header
- Invalid JSON format

**Solution:** Check test-api.ps1 format:
```powershell
$testData = @{
    frames = @("base64-data")  # Array, not string
    question = "Your question"
    context = @{ ... }
}
```

### 5. Git Push Conflicts

**Problem:** Push rejected due to conflicts or uncommitted changes.

**Solution:**
```powershell
# Check status
git status

# Stash uncommitted changes
git stash

# Pull latest
git pull origin main

# Apply stashed changes
git stash pop

# Resolve conflicts if any, then:
git add -A
git commit -m "Your message"
git push origin main
```

## Useful Commands

### Kill All Node Processes
```powershell
Get-Process -Name node | Stop-Process -Force
```

### Check What's Running on a Port
```powershell
# Check specific port
Get-NetTCPConnection -LocalPort 3001

# Find process using port
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess
```

### View Running Node Processes
```powershell
Get-Process -Name node | Select-Object Id, ProcessName, StartTime, CPU
```

### Test API Manually
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:3001/api/status"

# Plant analysis
$headers = @{ "Authorization" = "Bearer sk_dev_utobloom_2025" }
$body = @{ frames = @("test"); question = "test" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/analyze/plant" -Method Post -Headers $headers -Body $body -ContentType "application/json"
```

## Development Workflow

### Recommended Workflow for API Testing

1. **Start fresh:**
   ```powershell
   .\quick-test.ps1
   ```

2. **Make changes to server.js**

3. **Restart server:**
   ```powershell
   cd utovision-api
   .\stop-server.ps1
   .\start-server.ps1
   ```

4. **Run test:**
   ```powershell
   cd ..
   .\test-api.ps1
   ```

5. **Commit changes:**
   ```powershell
   git add -A
   git commit -m "Description of changes"
   git push origin main
   ```

### Recommended Workflow for Full Stack Development

1. **Start all services:**
   ```powershell
   # Terminal 1: UtoVision API
   cd utovision-api
   .\start-server.ps1

   # Terminal 2: UtoBloom Backend
   npm run server

   # Terminal 3: UtoBloom Frontend
   npm run client

   # Terminal 4: Serial Bridge (if using Arduino)
   npm run serial
   ```

2. **Access apps:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000
   - UtoVision API: http://localhost:3001

3. **Stop all services:**
   ```powershell
   Get-Process -Name node | Stop-Process -Force
   ```

## Script Reference

| Script | Purpose | Location |
|--------|---------|----------|
| `quick-test.ps1` | Start server + run test | Root |
| `test-api.ps1` | Test UtoVision API | Root |
| `start-server.ps1` | Start UtoVision API | utovision-api/ |
| `stop-server.ps1` | Stop all node processes | utovision-api/ |
| `start.ps1` / `start.bat` | Start all UtoBloom services | Root |

## Best Practices

1. **Always clean up processes before starting:**
   - Use the provided scripts (they handle cleanup automatically)
   - Or manually: `Get-Process -Name node | Stop-Process -Force`

2. **Use persistent windows for servers:**
   - Don't run servers in terminals that close
   - Use `-NoExit` flag with `Start-Process`

3. **Wait for server startup:**
   - Give servers 3-5 seconds to initialize
   - Check server output for "Server running" message

4. **Test incrementally:**
   - Test after each significant change
   - Use `.\quick-test.ps1` for rapid iteration

5. **Commit frequently:**
   - Commit working states
   - Use descriptive commit messages
   - Push to backup your work

## Environment Setup

### Required Software
- Node.js 18+
- PowerShell 5.1+
- Git
- MongoDB (for full UtoBloom app)

### Optional Tools
- Windows Terminal (better terminal experience)
- VS Code (recommended editor)
- Postman (API testing GUI)

## Additional Resources

- Full API Spec: `UTOVISION_API_SPEC.md`
- UtoBloom Features: `FEATURES.md`
- Architecture Overview: `README.md`
- UtoVision API Docs: `utovision-api/README.md`
