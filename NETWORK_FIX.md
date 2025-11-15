# Network Access Fix - November 2, 2025

## Current Network Configuration
- **Your PC's IP Addresses**: 
  - Primary: `10.88.111.2`
  - Secondary: `10.88.111.9`
- **Subnet**: `10.88.111.0/24`
- **Gateway**: `10.88.111.254`

## What Changed
After your network outage yesterday, your PC's IP address changed from `10.88.111.7` to `10.88.111.2` (or `.9`).

## Fixes Applied

### 1. Server Auto-Detection (✅ DONE)
The server now automatically detects your network IP address instead of using hardcoded values.

Location: `server/index.js`
- Added `getLocalIP()` function to detect current network IP
- Server logs now show: `http://10.88.111.2:3000/health`

### 2. WebSocket Auto-Connection (✅ DONE)
The client WebSocket connection now uses `window.location.hostname` to connect automatically.

Location: `client/src/pages/Home.jsx`
- WebSocket URL is built dynamically: `ws://${window.location.hostname}:3000/live`
- Works from any device on your network

## How to Use from External Devices

### From Your TV:
1. Make sure TV is on the same WiFi network (10.88.111.x)
2. Navigate to: `http://10.88.111.2:5173/?tv=1`

### From Your Phone (Samsung S24):
1. Connect to the same WiFi
2. Navigate to: `http://10.88.111.2:5173/`

### Test Connection:
From any device on your network, open a browser and go to:
```
http://10.88.111.2:3000/health
```
You should see: `{"status":"ok","message":"Uto Bloom server is running"}`

## Firewall Status
✅ Firewall rules already exist:
- Node.js JavaScript Runtime - Inbound Allow
- Vite 5173 - Inbound Allow
- Express 3000 - Inbound Allow

## Troubleshooting

### If devices still can't connect:

1. **Restart both server and client:**
   ```powershell
   # Stop all Node processes
   Get-Process -Name node | Stop-Process -Force
   
   # Start everything fresh
   npm start
   ```

2. **Check your current IP:**
   ```powershell
   ipconfig | Select-String "IPv4"
   ```

3. **Verify server is listening on 0.0.0.0:**
   ```powershell
   Get-NetTCPConnection -LocalPort 3000 | Select-Object LocalAddress,State
   ```
   Should show `0.0.0.0` with `Listen` state.

4. **Test from PC browser first:**
   - Open: `http://10.88.111.2:3000/health`
   - If this works, external devices should work too

5. **If Windows Defender blocks:**
   Run PowerShell as Administrator:
   ```powershell
   New-NetFirewallRule -DisplayName "UtoBloom Server" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000,5173
   ```

6. **Check network profile:**
   If your network is set as "Public", Windows may block connections. Change to "Private":
   ```powershell
   Get-NetConnectionProfile
   Set-NetConnectionProfile -InterfaceAlias "Wi-Fi" -NetworkCategory Private
   ```

## What Your TV/Phone Should See

When you access the app from external devices:
- They'll connect to `http://10.88.111.2:5173/`
- The client will automatically connect WebSocket to `ws://10.88.111.2:3000/live`
- No need to update device configurations!

## Future-Proof Solution
The server will now automatically detect and display your current IP address every time it starts. If your IP changes again:
1. Just restart the server
2. Note the new IP from the console
3. Update bookmarks on your TV/phone

## Console Output
When server starts, you'll see:
```
🌱 Uto Bloom server running on 0.0.0.0:3000
📡 Local access: http://localhost:3000/health
📺 Network access: http://10.88.111.2:3000/health
📚 API docs: http://10.88.111.2:3000/
🔴 WebSocket server ready
   Local: ws://localhost:3000/live
   Network: ws://10.88.111.2:3000/live
```

Use the "Network access" URLs for your TV and phone!
