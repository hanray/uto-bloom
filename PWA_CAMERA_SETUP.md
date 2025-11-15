# PWA Camera Access on Android

## ✅ What I Just Fixed
Added `Permissions-Policy` meta tag to allow camera access in PWA

## 🔒 Camera Requirements for PWA

### 1. **HTTPS is REQUIRED** (except localhost)
- ❌ `http://192.168.1.100:5173` - **WILL NOT WORK**
- ✅ `https://192.168.1.100:5173` - **WILL WORK**
- ✅ `http://localhost:5173` - **WILL WORK**

### 2. **Browser Compatibility**
Works in:
- ✅ Chrome for Android
- ✅ Samsung Internet
- ✅ Firefox for Android
- ❌ Some WebView apps may block camera

## 🚀 Quick Setup Options

### Option A: Use HTTPS with Self-Signed Certificate (Recommended)

1. **Install mkcert** (one-time setup):
```powershell
# Using Chocolatey
choco install mkcert

# Or download from: https://github.com/FiloSottile/mkcert
```

2. **Create local HTTPS certificate**:
```powershell
cd "E:\E\Creative Work\Backend Dev\UtoBloom\client"
mkcert -install
mkcert localhost 192.168.1.100 192.168.1.x
```

3. **Update vite.config.js** to use HTTPS:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: {
      key: fs.readFileSync('./localhost+2-key.pem'),
      cert: fs.readFileSync('./localhost+2.pem')
    }
  }
})
```

4. **Access via**: `https://192.168.1.x:5173`

### Option B: Use Ngrok (Easiest, No Config)

1. **Install ngrok**:
```powershell
choco install ngrok
# Or download from: https://ngrok.com/download
```

2. **Start your dev server** (keep it running):
```powershell
npm start
```

3. **In another terminal, create HTTPS tunnel**:
```powershell
ngrok http 5173
```

4. **Use the HTTPS URL** from ngrok output:
```
Forwarding   https://abc123.ngrok.io -> http://localhost:5173
```

5. Access on mobile: `https://abc123.ngrok.io`

### Option C: Local Network Access (Testing Only)

If you want to test without HTTPS (won't work for camera):
```powershell
# Check your PC's local IP
ipconfig

# Look for "IPv4 Address" (e.g., 192.168.1.100)
# Access from mobile: http://192.168.1.100:5173
```

⚠️ **This will NOT allow camera access** - only for testing other features

## 📱 After Setup

1. Open the HTTPS URL in Chrome/Samsung Internet on Android
2. Tap "Install App" when prompted (PWA install banner)
3. Open installed app
4. Tap AI tile - you should see camera permission prompt
5. Grant permission
6. Camera should work!

## 🐛 Troubleshooting

**Still getting "Permission denied"?**
- Make sure you're using HTTPS (check URL bar for 🔒)
- Try Chrome for Android specifically
- Clear browser cache and reinstall PWA
- Check Settings > Apps > Uto Bloom > Permissions > Camera is enabled

**"Not secure" warning?**
- For self-signed cert: Accept the warning (click Advanced > Proceed)
- Better: Use ngrok which has valid SSL certificate

**Camera works in browser but not in installed PWA?**
- Uninstall the PWA
- Clear Chrome data
- Reinstall PWA from the HTTPS URL

## 🔍 Check Current Setup

Run this to see your current Vite config:
```powershell
cat client/vite.config.js
```

If you don't see `https:` section, you need to add it using Option A above.
