# TV Network Configuration - Quick Reference

**Your PC's IP Address**: `10.88.111.7`  
**WiFi Network**: 10.88.111.x subnet  
**Date**: October 21, 2025

---

## ✅ Configuration Applied

### 1. Windows Firewall Rules (Already Added)
```powershell
New-NetFirewallRule -DisplayName "Vite 5173" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5173
New-NetFirewallRule -DisplayName "Express 3000" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000
```

### 2. Express Server (server/index.js)
- **Binding**: `0.0.0.0:3000` (accepts connections from all network interfaces)
- **Local access**: http://localhost:3000
- **TV access**: http://10.88.111.7:3000
- **WebSocket**: ws://10.88.111.7:3000/live

### 3. Vite Dev Server (client/vite.config.js)
- **Binding**: `0.0.0.0:5173` (accepts connections from all network interfaces)
- **Local access**: http://localhost:5173
- **TV access**: http://10.88.111.7:5173

### 4. Android TV App (apk/tv-app/.../MainActivity.kt)
- **URL**: http://10.88.111.7:5173/?tv=1

---

## 🚀 How to Start Services

```powershell
# From project root:
.\start.bat

# Or:
npm.cmd start
```

**Expected Console Output**:
```
[SERVER] 🌱 Uto Bloom server running on 0.0.0.0:3000
[SERVER] 📺 TV access: http://10.88.111.7:3000/health
[SERVER] 🔴 WebSocket server ready
[SERVER]    TV: ws://10.88.111.7:3000/live
[CLIENT] VITE v5.4.21  ready in 254 ms
[CLIENT] ➜  Local:   http://localhost:5173/
[CLIENT] ➜  Network: http://10.88.111.7:5173/
```

---

## 🧪 Testing Network Connectivity

### From Your PC (Test Servers are Running)
```powershell
# Test Express server
curl http://10.88.111.7:3000/health

# Test Vite server (should return HTML)
curl http://10.88.111.7:5173/
```

### From Your TV Browser (Before Installing APK)
1. Open Chrome or TV's built-in browser
2. Navigate to: `http://10.88.111.7:5173/?tv=1`
3. You should see the Uto Bloom onboarding screen

**If it doesn't work**:
- Check PC and TV are on same WiFi
- Verify firewall rules: `Get-NetFirewallRule -DisplayName "*5173*"`
- Check Windows Defender isn't blocking (temporarily disable to test)
- Ensure no VPN is running on PC

---

## 📱 Installing Android TV APK

### 1. Build APK with Correct IP
```powershell
cd "E:\E\Creative Work\Backend Dev\UtoBloom\apk\tv-app"

# MainActivity.kt already updated with 10.88.111.7
.\gradlew.bat assembleRelease
```

### 2. Install on TV
```powershell
# Get your TV's IP (Settings → Network → WiFi)
adb connect YOUR_TV_IP:5555

# Install APK
adb install -r app\build\outputs\apk\release\app-release.apk
```

### 3. Launch App
- Open "Uto Bloom TV" from TV's Apps section
- App loads: http://10.88.111.7:5173/?tv=1

---

## 🔍 Troubleshooting

### Issue: TV can't reach PC servers

**Check 1: Firewall Rules Active?**
```powershell
Get-NetFirewallRule -DisplayName "Vite 5173" | Select-Object DisplayName, Enabled, Direction, Action
Get-NetFirewallRule -DisplayName "Express 3000" | Select-Object DisplayName, Enabled, Direction, Action
```
Both should show `Enabled: True`, `Action: Allow`

**Check 2: Servers Binding to 0.0.0.0?**
```powershell
# Check what's listening on ports
netstat -an | findstr "5173"
netstat -an | findstr "3000"
```
Should show: `0.0.0.0:5173` and `0.0.0.0:3000` (not `127.0.0.1`)

**Check 3: PC and TV on Same Network?**
- PC: 10.88.111.7
- TV: Should be 10.88.111.x (check TV's network settings)
- Gateway: 10.88.111.254 (should match)

**Check 4: Windows Defender Not Blocking?**
```powershell
# Temporarily disable public network blocking (test only)
Set-NetFirewallProfile -Profile Public -Enabled False

# Test, then re-enable:
Set-NetFirewallProfile -Profile Public -Enabled True
```

**Check 5: Network Profile**
```powershell
# Check if WiFi is set to "Private" (not "Public")
Get-NetConnectionProfile

# If Public, change to Private for easier firewall rules:
Set-NetConnectionProfile -InterfaceAlias "Wi-Fi" -NetworkCategory Private
```

---

## 🌐 Network Flow Diagram

```
[Android TV]
    │ WiFi: 10.88.111.x
    │
    ↓ HTTP GET
http://10.88.111.7:5173/?tv=1
    │
    ↓
[Your PC - Vite Server]
    Host: 0.0.0.0:5173
    Network IP: 10.88.111.7
    │
    ↓ Serves React PWA
    │
[React App in TV's WebView]
    │
    ↓ WebSocket Connection
ws://10.88.111.7:3000/live
    │
    ↓ API Calls
http://10.88.111.7:3000/api/*
    │
    ↓
[Your PC - Express Server]
    Host: 0.0.0.0:3000
    Network IP: 10.88.111.7
    │
    ↓
[MongoDB Atlas]
    (via internet)
```

---

## 📝 Key Changes Made

### server/index.js
```javascript
// Before:
const server = app.listen(PORT, () => { ... });

// After:
const HOST = '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  console.log(`📺 TV access: http://10.88.111.7:${PORT}/health`);
});
```

### client/vite.config.js
```javascript
// Before:
server: {
  port: 5173,
  proxy: { ... }
}

// After:
server: {
  host: '0.0.0.0', // Allows TV to connect
  port: 5173,
  proxy: { ... }
}
```

### apk/tv-app/.../MainActivity.kt
```kotlin
// Before:
private val appUrl = "http://192.168.1.100:5173/?tv=1"

// After:
private val appUrl = "http://10.88.111.7:5173/?tv=1"
```

---

## ✅ Verification Checklist

Before building APK:
- [ ] Start services: `.\start.bat`
- [ ] Check server binds to 0.0.0.0 (see console output)
- [ ] Test from PC browser: http://10.88.111.7:5173
- [ ] Test from TV browser: http://10.88.111.7:5173/?tv=1
- [ ] Verify WebSocket connects (check browser console)
- [ ] Check API works: http://10.88.111.7:3000/health

After APK built:
- [ ] MainActivity.kt has correct IP (10.88.111.7)
- [ ] APK installed on TV
- [ ] App launches and loads UI
- [ ] Real-time updates work (check status changes every 15s)

---

## 🎯 Quick Commands

**Start everything**:
```powershell
.\start.bat
```

**Check if TV can reach servers** (from TV browser):
```
http://10.88.111.7:3000/health
http://10.88.111.7:5173/
```

**Rebuild APK with updated IP**:
```powershell
cd apk\tv-app
.\gradlew.bat assembleRelease
```

**Reinstall on TV**:
```powershell
adb install -r app\build\outputs\apk\release\app-release.apk
```

---

**Network is configured!** Test from TV browser first, then build APK. 🚀📺
