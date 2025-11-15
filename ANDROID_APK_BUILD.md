# Building Android APK with Camera Permissions

## ✅ What This Fixes
- Native Android app with proper camera permissions in AndroidManifest.xml
- No more browser permission issues
- Works offline (once installed)
- Proper native app experience

## 🔧 Prerequisites

1. **Install Android Studio**:
   - Download: https://developer.android.com/studio
   - Install with Android SDK, Android SDK Platform, and Android Virtual Device

2. **Install Java JDK 17**:
```powershell
choco install openjdk17
```

## 📦 Build Steps

### 1. Install Dependencies (if not already done)
```powershell
cd "E:\E\Creative Work\Backend Dev\UtoBloom\client"
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### 2. Initialize Capacitor
```powershell
cd "E:\E\Creative Work\Backend Dev\UtoBloom\client"
npx cap init
```

### 3. Build the Web App
```powershell
npm run build
```

### 4. Add Android Platform
```powershell
npx cap add android
```

### 5. Configure API URLs for Production

Before building, update `client/src/utils/utoVisionAPI.js` to use your server's IP instead of localhost:

```javascript
// Change this:
const UTOVISION_API_URL = '/utovision';

// To your PC's network IP (get with ipconfig):
const UTOVISION_API_URL = 'http://10.88.111.2:3001';
```

And in `client/src/hooks/useAIAssistant.js`:
```javascript
// Change this:
await fetch('/api/client-error', {

// To:
await fetch('http://10.88.111.2:3000/api/client-error', {
```

**OR** use environment variables (better approach - see below).

### 6. Sync Files to Android Project
```powershell
npx cap sync android
```

### 7. Open in Android Studio
```powershell
npx cap open android
```

### 8. Add Camera Permission

Android Studio will open. Edit `android/app/src/main/AndroidManifest.xml` and add:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Add these permissions -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <application>
        ...
    </application>
</manifest>
```

### 9. Build APK in Android Studio

1. Click **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
2. Wait for build to finish
3. APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### 10. Install on Phone

#### Option A: USB
1. Enable USB Debugging on phone (Settings > Developer Options)
2. Connect phone via USB
3. Click **Run** in Android Studio

#### Option B: Transfer APK
1. Copy `app-debug.apk` to phone
2. Install and allow "Install from unknown sources"

## 🔥 Quick Build Script

After initial setup, use this to rebuild:

```powershell
# Build script
cd "E:\E\Creative Work\Backend Dev\UtoBloom\client"
npm run build
npx cap sync android
npx cap open android
```

Then in Android Studio: Build > Build APK

## 🌐 Environment Variables (Recommended)

Instead of hardcoding IPs, use environment variables:

### 1. Create `.env` file:
```env
VITE_API_URL=http://10.88.111.2:3000
VITE_VISION_URL=http://10.88.111.2:3001
```

### 2. Update code to use env vars:
```javascript
// utoVisionAPI.js
const UTOVISION_API_URL = import.meta.env.VITE_VISION_URL || '/utovision';

// useAIAssistant.js
const API_URL = import.meta.env.VITE_API_URL || '';
await fetch(`${API_URL}/api/client-error`, {
```

### 3. For production build:
```powershell
npm run build  # Vite automatically uses .env
```

## 📱 Testing

1. Install APK on phone
2. Open Uto Bloom app
3. Tap AI tile
4. **You should see camera permission dialog** ✅
5. Grant permission
6. Camera works!

## 🐛 Troubleshooting

**"Cleartext HTTP not permitted"**:
- Make sure `androidScheme: "https"` is in capacitor.config.json
- OR add `android:usesCleartextTraffic="true"` to `<application>` in AndroidManifest.xml

**Camera still not working**:
- Check AndroidManifest.xml has camera permissions
- Uninstall old app and reinstall fresh APK
- Check Settings > Apps > Uto Bloom > Permissions > Camera is allowed

**Build errors**:
- Make sure Java 17 is installed: `java -version`
- Make sure Android SDK is installed
- Run `npx cap doctor` to diagnose issues

## 📝 Notes

- **Debug APK**: For testing (larger file, includes debug symbols)
- **Release APK**: For production (needs signing key, much smaller)
- Camera permission will be requested when user taps AI tile
- App can work offline once installed (except AI analysis which needs server)
