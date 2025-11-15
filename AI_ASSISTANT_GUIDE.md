# AI Assistant Feature - Implementation Guide

## Overview
The AI Assistant feature integrates UtoVision API to provide real-time plant health analysis using camera input and sensor data.

## Features Implemented

### 1. **AI Assistant Tile** ✨
- Located above the Moisture tile in the metrics column
- Purple tile with sparkles icon
- Shows current status: "Click to start", "Active", "Connecting...", or "Error"
- Click to activate/deactivate AI analysis

### 2. **Dynamic Status Indicator**
- Replaces static "Last updated" timestamp
- Shows AI status with color coding:
  - **Idle** (gray): Shows last update time
  - **Connecting** (orange): "AI Assistant connecting..."
  - **Active** (green): "AI Assistant active • Analyzing plant"
  - **Error** (red): "AI Assistant error • Check permissions"
- Animated pulsing dot when connecting

### 3. **AI Responses Feed**
- Full-width scrollable tile displaying last 10 AI insights
- Newest responses at top
- Each response includes:
  - Emoji icon based on type (🔍 analysis, 💚 health, ⚠️ issue)
  - Timestamp
  - Message text
  - Confidence bar (if available)
- Older responses fade (items 8-10)
- Custom scrollbar with purple accent
- Empty state with helpful message

### 4. **Camera Integration**
- Auto-detects if device has webcam
- Requests camera permission when AI activated
- Continuous analysis every 30 seconds
- Hidden video element for frame capture
- Proper cleanup on component unmount

### 5. **QR Code Modal**
- Shows QR code for devices without camera
- Displays Uto Labs logo
- Includes URL for manual access
- Clean, modern design with purple accent

## Component Architecture

```
src/
├── components/
│   ├── QRCodeModal.jsx          # QR code display
│   ├── QRCodeModal.css
│   ├── AIResponsesFeed.jsx      # Responses list
│   └── AIResponsesFeed.css
├── hooks/
│   └── useAIAssistant.js        # AI state management
├── utils/
│   └── utoVisionAPI.js          # API integration
└── pages/
    └── Home/
        ├── HomeDesktop.jsx      # Updated with AI
        └── HomeMobile.jsx       # Updated with AI
```

## Usage

### Desktop
1. Click the purple ✨ AI Assistant tile
2. If camera available, analysis starts automatically
3. If no camera, QR code modal appears
4. Responses appear in feed below metrics
5. Click tile again to stop

### Mobile
1. Tap the purple ✨ AI Assistant tile (2x2 grid, top-left)
2. On mobile devices, camera typically works
3. QR code shown if camera unavailable
4. Responses scroll in feed below
5. Tap again to stop

## API Integration

### Endpoints Used
- `POST /api/analyze/plant` - Health analysis with sensor context
- `GET /api/status` - Check API availability

### Analysis Frequency
- Every 30 seconds when active
- Captures frame from video stream
- Sends with plant context (moisture, temp, humidity, light)

### Response Types
- **health**: Overall health assessment
- **analysis**: Care recommendations
- **issue**: Problems detected
- **error**: Analysis failures

## Configuration

### API Settings
Edit `src/utils/utoVisionAPI.js`:
```javascript
const UTOVISION_API_URL = 'http://localhost:3001';
const API_KEY = 'sk_utobloom_your_secret_key_here';
```

### QR Code URL
Auto-generated based on current origin:
```javascript
const qrUrl = `${window.location.origin}/ai-assistant?plant=pot-01`;
```

## Styling

### Color Scheme
- **Purple tile**: `hsl(258, 75%, 55%)`
- **Active status**: `#10b981` (green)
- **Connecting**: `#f59e0b` (orange)
- **Error**: `#ef4444` (red)
- **Idle**: `rgba(255, 255, 255, 0.7)` (gray)

### Layout Changes
- Metrics column now displays 4 tiles (was 3)
- Tile height reduced from 136px to 102px
- Gap reduced from 20px to 16px
- Mobile grid changed to 2x2 (was 1x3)

## Browser Compatibility

### Camera Access
- Chrome: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ With permissions
- Edge: ✅ Full support
- Mobile browsers: ✅ Typically supported

### Fallback
- Devices without camera: QR code modal
- Permission denied: Error message with QR option
- API offline: Error status displayed

## Future Enhancements

### Potential Features
1. Voice interaction for hands-free operation
2. Plant disease database integration
3. History of AI insights
4. Downloadable health reports
5. Multi-plant monitoring
6. Scheduled analysis times
7. Push notifications for issues

## Troubleshooting

### Camera not working
- Check browser permissions
- Ensure HTTPS (required for camera)
- Try different browser
- Use QR code fallback

### API errors
- Verify UtoVision API is running (localhost:3001)
- Check API key configuration
- Review network/CORS settings
- Check server logs

### No responses appearing
- Verify camera is active (check AI status)
- Wait 30 seconds for first analysis
- Check browser console for errors
- Ensure API endpoints are correct

## Dependencies Added
- `qrcode` - QR code generation library

## Files Modified
- `client/package.json` - Added qrcode dependency
- `client/src/App.css` - AI styles, layout updates
- `client/src/pages/Home/HomeDesktop.jsx` - AI integration
- `client/src/pages/Home/HomeMobile.jsx` - AI integration

## Files Created
- `client/src/components/QRCodeModal.jsx`
- `client/src/components/QRCodeModal.css`
- `client/src/components/AIResponsesFeed.jsx`
- `client/src/components/AIResponsesFeed.css`
- `client/src/hooks/useAIAssistant.js`
- `client/src/utils/utoVisionAPI.js`

---

**Implementation complete!** 🎉 The AI Assistant is now fully integrated into UtoBloom.
