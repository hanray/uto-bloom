# TV Mode - Implementation Guide

**Date**: October 21, 2025  
**Status**: ✅ Implemented

---

## 🎮 How TV Mode Works

The Uto Bloom PWA now detects when it's being viewed on a TV and automatically adapts the UI for remote control (DPAD) navigation.

### Activation

TV mode is activated by adding `?tv=1` to the URL:

```
http://10.88.111.7:5173/?tv=1
```

This is automatically handled by your Android TV WebView app (MainActivity.kt loads with this parameter).

---

## 🔧 What Changed

### 1. Onboarding Page (Plant Selection)

**Before** (Mouse/Touch):
- Search input for typing
- Click to select plant
- No keyboard navigation

**After** (TV/DPAD):
- Search input hidden (can't type with remote)
- Shows all plants by default (top 10)
- **Arrow Up/Down**: Navigate through plant list
- **Enter**: Select highlighted plant
- Visual focus indicator (purple glow)
- Auto-scroll to keep selected item visible

### 2. Home Page

**Before**:
- Standard font sizes (1rem base)
- Optimized for 30-60cm viewing (desktop/mobile)

**After** (TV mode):
- 1.5rem base font size
- Headings scaled up (3.5rem)
- Status badges larger (2.5rem)
- Buttons larger (1.8rem font, 1.5rem padding)
- Readable from 2-3 meters away

### 3. Visual Feedback

**TV Mode Indicators**:
- `.tv-selected` class: Purple border + glow + scale(1.05)
- Non-selected items: 70% opacity
- 3px focus outlines on all interactive elements
- Smooth transitions (0.3s ease)

---

## 🎯 Implementation Details

### Detection Logic

```javascript
// In any component:
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const tvMode = params.get('tv') === '1';
  setIsTVMode(tvMode);
  
  if (tvMode) {
    console.log('🎮 TV mode enabled - DPAD navigation active');
  }
}, []);
```

### Keyboard Event Handling

```javascript
useEffect(() => {
  if (!isTVMode) return;

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        // Move selection down
        break;
      case 'ArrowUp':
        e.preventDefault();
        // Move selection up
        break;
      case 'Enter':
        e.preventDefault();
        // Activate selected item
        break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isTVMode, selectedIndex]);
```

### CSS Classes

```css
/* Automatically applied when ?tv=1 is present */
.tv-mode {
  font-size: 1.5rem; /* Base font scaled for TV */
}

/* Applied to selected/focused item */
.tv-selected {
  border-color: var(--accent);
  box-shadow: 0 0 30px rgba(124, 58, 237, 0.5);
  transform: scale(1.05);
}
```

---

## 🧪 Testing TV Mode

### Option 1: Test in Browser (Without TV)

```
http://localhost:5173/?tv=1
```

- Open your browser
- Use keyboard arrow keys to navigate
- Press Enter to select
- See TV-sized fonts and focus indicators

### Option 2: Test on Android TV

1. Build and install APK (MainActivity.kt already has `?tv=1`)
2. Launch "Uto Bloom TV" app on TV
3. Use TV remote:
   - **D-PAD Up/Down**: Navigate
   - **OK/Center**: Select

---

## 📱 Pages Supported

### ✅ Implemented
- **Onboarding** (`/onboarding`): Full DPAD navigation
- **Home** (`/`): TV-optimized fonts and layout

### ⏳ To Do
- **Details** (`/details`): Add DPAD navigation for back button
- **History** (`/history`): Add DPAD navigation for range selector

---

## 🎨 UI Differences (TV vs Desktop)

| Element | Desktop | TV Mode |
|---------|---------|---------|
| Base font | 1rem (16px) | 1.5rem (24px) |
| H1 heading | 2rem | 3.5rem |
| Status badge | 1rem | 2.5rem |
| Buttons | 1rem | 1.8rem |
| Input fields | Visible | Hidden (can't type with remote) |
| Plant list | All clickable | One highlighted with DPAD |
| Focus indicators | Subtle | Bold purple glow |
| Item opacity | 100% | 70% (non-selected) |

---

## 🔍 Troubleshooting

### Issue: "TV mode not activating"

**Check**:
```javascript
// In browser console:
window.location.search
// Should show: ?tv=1
```

**Fix**: Ensure MainActivity.kt URL includes `?tv=1`:
```kotlin
private val appUrl = "http://10.88.111.7:5173/?tv=1"
```

### Issue: "Can't select plants on TV"

**Symptoms**: Arrow keys don't work, no visual feedback

**Possible Causes**:
1. Android WebView blocking keyboard events
2. JavaScript errors preventing event listeners

**Debug**:
```javascript
// Check TV mode detection (browser console on TV):
console.log('Is TV mode?', params.get('tv') === '1');
```

**Fix in MainActivity.kt** (if needed):
```kotlin
// Add explicit key event handling
wv.setOnKeyListener { v, keyCode, event ->
  if (event.action == KeyEvent.ACTION_DOWN) {
    when (keyCode) {
      KeyEvent.KEYCODE_DPAD_CENTER, KeyEvent.KEYCODE_ENTER -> {
        v.performClick()
        false
      }
      else -> false
    }
  } else false
}
```

### Issue: "Fonts too small on TV"

**Check**: Ensure TV mode is active (see above)

**Manual override** (for testing):
```javascript
// Force TV mode in browser console:
localStorage.setItem('forceTV', 'true');
location.reload();

// Then modify useEffect:
const tvMode = params.get('tv') === '1' || localStorage.getItem('forceTV') === 'true';
```

### Issue: "Plant list doesn't show in TV mode"

**Reason**: Default behavior shows empty list until search (≥2 characters)

**Fix** (already implemented):
```javascript
// In Onboarding.jsx:
if (isTVMode && searchTerm.length === 0) {
  setResults(catalog.slice(0, 10)); // Show top 10 by default
}
```

---

## 🚀 Future Enhancements

### Planned Features

1. **Voice Search** (if Android TV supports Web Speech API)
```javascript
const recognition = new webkitSpeechRecognition();
recognition.onresult = (event) => {
  setSearchTerm(event.results[0][0].transcript);
};
```

2. **Remote Control Shortcuts**
   - Red button: Emergency water alert
   - Green button: Mark as watered
   - Yellow button: Snooze alerts
   - Blue button: Toggle chart view

3. **Picture-in-Picture** (keep monitoring while watching TV)
```javascript
if (document.pictureInPictureEnabled) {
  videoElement.requestPictureInPicture();
}
```

4. **Android TV-specific Features**
   - Leanback UI components
   - Recommendations row
   - Google Assistant integration
   - Cast from phone to TV

---

## 📝 Files Modified

### Updated Files:
1. **client/src/pages/Onboarding.jsx**
   - Added TV mode detection (`?tv=1` parameter)
   - Implemented DPAD navigation (Arrow keys + Enter)
   - Added `selectedIndex` state and keyboard event handlers
   - Shows all plants by default in TV mode
   - Hides search input on TV
   - Added `.tv-selected` class for visual feedback

2. **client/src/pages/Home.jsx**
   - Added TV mode detection
   - Applied `.tv-mode` class to container

3. **client/src/App.css**
   - Added 60+ lines of TV-specific styles
   - `.tv-mode` class scales fonts 1.5x
   - `.tv-selected` class adds purple glow + scale
   - Button focus indicators (3px outline)
   - Hide search input in TV mode
   - Opacity dimming for non-selected items

---

## ✅ Verification Checklist

### Desktop Browser Test:
- [ ] Open http://localhost:5173/?tv=1
- [ ] See larger fonts throughout
- [ ] Onboarding shows 10 plants immediately
- [ ] Arrow keys navigate plant list
- [ ] Selected plant has purple border + glow
- [ ] Enter key selects plant
- [ ] Home page shows larger status badge

### Android TV Test:
- [ ] Launch "Uto Bloom TV" app
- [ ] Onboarding loads with plant list visible
- [ ] TV remote D-PAD Up/Down navigates
- [ ] TV remote OK button selects plant
- [ ] Home page readable from couch (2-3m away)
- [ ] Status updates in real-time
- [ ] Buttons navigable with remote

---

**TV Mode is ready!** The app now provides a fully usable experience for TV remote navigation. 🎮📺🌱
