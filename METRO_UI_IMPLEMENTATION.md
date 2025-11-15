# Metro UI Implementation Plan

**Status**: Pending Review  
**Target**: Desktop, TV (4K), and Mobile layouts  
**Design Source**: Figma node 32-804  
**Date**: November 4, 2025

---

## Phase 1: Icon Mapping & Asset Preparation

### 1.1 Map Figma Icons to Existing SVGs
- [x] Moisture icon → `client/src/icons/moisture.svg`
- [ ] Temperature icon → use `moisture.svg` (per user request)
- [ ] Battery icon → find in `client/src/icons/`
- [ ] Health icon → `client/src/icons/health4x.png`
- [ ] History icon → `client/src/icons/history.png` or `clock.svg`
- [ ] Camera/Settings icon → `client/src/icons/camera.svg` or `monitor.svg`

### 1.2 Retrieve Purple Chart Styling
- [ ] Find purple chart styling and animations from backup files
- [ ] Extract CSS for moisture trend graph (purple theme)
- [ ] Locate chart bubble animations

---

## Phase 2: Desktop Layout (HomeDesktop.jsx)

### 2.1 Header Section (Equal Width to Top Section)
- [ ] Create header container matching top section width (1145px)
- [ ] Left: "Uto Bloom" title (blue #6898ff, 24px Arial)
- [ ] Left subtitle: "Monstera • Living Room" (white, 16px)
- [ ] Center: Active device badge (white bg, rounded, "Monstera • Active")
- [ ] Right: Last updated timestamp ("Last updated 09:24 PM", gray text)

### 2.2 Status Card (Full Width)
- [ ] White/transparent background (rgba(255,255,255,0.6))
- [ ] Rounded 24px corners
- [ ] Icon + status message ("I'm in need of water")
- [ ] Shadow: 0px 8px 32px rgba(0,0,0,0.06)
- [ ] Height: 120px
- [ ] Data binding: `statusConfig.text` and `statusConfig.emoji`

### 2.3 Top Section Grid Layout
**Left Column: Metric Tiles (3 stacked, 140px width each)**
- [ ] **Moisture Tile**
  - Blue shadow: rgba(59,130,246,0.05)
  - Icon: moisture.svg (white, 20px)
  - Label: "Moisture" (12px, white, 75% opacity)
  - Value: "32%" → bind to `lastReading?.soil_raw`
  - Height: 136px, rounded 16px
  
- [ ] **Temperature Tile**
  - Orange shadow: rgba(251,146,60,0.05)
  - Icon: moisture.svg (white, 20px) ← use same icon per user
  - Label: "Temperature" (12px, white, 75% opacity)
  - Value: "22.5°C" → bind to `lastReading?.temp_c`
  - Height: 136px, rounded 16px
  
- [ ] **Battery Tile**
  - Green shadow: rgba(34,197,94,0.05)
  - Icon: (find battery icon, white, 20px)
  - Label: "Battery" (12px, white, 75% opacity)
  - Value: "87%" → bind to battery data (add to API if missing)
  - Height: 136px, rounded 16px

**Right Area: 3D Plant Visualization**
- [ ] Large tile (takes remaining width, ~939px)
- [ ] Height: 550px
- [ ] Rounded 16px, padding 20px
- [ ] Label: "3D Plant Visualization" (12px, black)
- [ ] Insert: `<PlantVisualization moisture={lastReading?.soil_raw || 343} species={selectedSpecies} height="500px" />`

### 2.4 Bottom Section (3 Tiles Side-by-Side)
- [ ] **Health Tile** (266px width, 267px height)
  - Purple shadow: rgba(168,85,247,0.3)
  - Icon: health icon (white, 20px)
  - Label: "Health" (12px, white, 75% opacity)
  - Text: "View Details" (14px, white)
  - Clickable → navigate to `/details`
  
- [ ] **Moisture Trend Graph Tile** (644px width, 382px height)
  - Label: "Moisture Trend graph" (14px, black)
  - Purple chart styling from backup
  - Insert: Chart.js Line component with purple gradient
  - Include bubble animations
  - Data: `chartData` from hook
  
- [ ] **History Tile** (266px width, 267px height)
  - Cyan shadow: rgba(6,182,212,0.3)
  - Icon: history icon (white, 20px)
  - Label: "History" (12px, white, 75% opacity)
  - Text: "View Trends" (14px, white)
  - Clickable → navigate to `/history`

### 2.5 Left Sidebar Navigation (Vertical, Rotated 90°)
- [ ] Container: White background (rgba(255,255,255,0.8)), rounded pill, shadow
- [ ] Position: Fixed left, rotated 90 degrees
- [ ] Buttons (52px each):
  - Health button (green shadow, active state)
  - Details button (gray, inactive)
  - History button (gray, inactive)
  - Settings button (gray, inactive)
- [ ] Active state: colored shadow visible
- [ ] Inactive state: gray background, 60% opacity

---

## Phase 3: TV Layout (HomeTV.jsx)

### 3.1 Layout Structure
- [ ] **Identical markup to Desktop** (same component structure)
- [ ] Same header, status card, metric tiles, plant viz, bottom tiles, sidebar

### 3.2 Focus Management (D-pad Navigation Architecture)

**Navigation Principles**
- Clear path to all focusable elements (no overlapping controls)
- Horizontal axis: Browse items within same category
- Vertical axis: Move between different categories/sections
- Fixed start destination: Always return to same screen (Home)
- Deep linking simulates manual navigation (back button returns to Home)

**Focusable Layout Map**
```
[Left Navigation Menu (Vertical Axis)]
  ↓ Health (active - animated glow)
  ↓ Details
  ↓ History
  ↓ Settings

[Main Content (Horizontal Axis)]
  → [Top Section - DISPLAY ONLY, NOT FOCUSABLE]
  → [Bottom Section - FOCUSABLE TILES]
     → Health Tile
     → History Tile
     (Chart tile NOT focusable - display only)
```

**Focus Zones**

- [ ] **Top Section: DISPLAY ONLY (Not Focusable)**
  - Metric tiles cannot receive focus
  - Plant visualization tile cannot receive focus
  - User can only view, no interaction
  - D-pad passes through this area
  
- [ ] **Left Navigation Sidebar: PRIMARY FOCUS ZONE (Vertical Axis)**
  - Default focus on current active menu item (Health)
  - Arrow Up/Down: Navigate between menu items (vertical)
  - Arrow Right: Move focus to content area (bottom tiles)
  - Enter: Activate/navigate to selected page
  - Active item has animated circular glow (see animation spec below)
  
- [ ] **Bottom Section: SECONDARY FOCUS ZONE (Horizontal Axis)**
  - Health tile focusable (golden outline on focus)
  - History tile focusable (golden outline on focus)
  - Chart tile NOT focusable (display only, no outline)
  - Arrow Left/Right: Navigate between tiles (horizontal)
  - Arrow Left (when at first tile): Return focus to navigation menu
  - Enter: Activate/navigate to selected page

**Focus Behavior & Flow**

- [ ] **Page Load (Fixed Start Destination)**
  - Default focus: Navigation menu (active item = Health)
  - User always starts at same position for predictability
  
- [ ] **Navigation Flow**
  - **Arrow Left (Global)**: 
    - From content → Jump to navigation menu
    - Quick return to top/menu (TV best practice)
    - Takes user to active menu item
  
  - **Arrow Right**: 
    - From menu → Move to content (first focusable bottom tile)
    - Opens content area for interaction
  
  - **Arrow Up/Down (Context-Dependent)**:
    - In menu: Navigate menu items vertically
    - In bottom tiles: Navigate tiles vertically (if stacked)
  
  - **Arrow Left/Right (In Content)**:
    - Navigate between bottom tiles horizontally
    - Predictable axis-based movement
  
  - **Escape Key**: 
    - Return to default focus (navigation menu, active item)
    - Quick exit to known state
  
  - **Enter Key**: 
    - Activate focused element (navigate to page)

**Scrolling Lists (If Applicable)**
- [ ] D-pad up/down scrolls entire list
- [ ] Each list item individually selectable
- [ ] Clear visual feedback for scroll position

### 3.3 Animated Glow for Active Menu Item

**Visual Specification**
- [ ] Active menu item (Health) has green shadow: `rgba(34,197,94,0.3)`
- [ ] Glow animates in circular motion around icon
- [ ] Animation: Smooth, continuous, subtle (not distracting)
- [ ] Duration: 3-4 seconds per rotation
- [ ] Easing: Linear for consistent circular motion

**CSS Animation**
```css
@keyframes circularGlow {
  0% {
    box-shadow: 
      0 -4px 16px rgba(34,197,94,0.6),
      4px 0 16px rgba(34,197,94,0.2),
      0 4px 16px rgba(34,197,94,0.1),
      -4px 0 16px rgba(34,197,94,0.1);
  }
  25% {
    box-shadow: 
      0 -4px 16px rgba(34,197,94,0.1),
      4px 0 16px rgba(34,197,94,0.6),
      0 4px 16px rgba(34,197,94,0.2),
      -4px 0 16px rgba(34,197,94,0.1);
  }
  50% {
    box-shadow: 
      0 -4px 16px rgba(34,197,94,0.1),
      4px 0 16px rgba(34,197,94,0.1),
      0 4px 16px rgba(34,197,94,0.6),
      -4px 0 16px rgba(34,197,94,0.2);
  }
  75% {
    box-shadow: 
      0 -4px 16px rgba(34,197,94,0.2),
      4px 0 16px rgba(34,197,94,0.1),
      0 4px 16px rgba(34,197,94,0.1),
      -4px 0 16px rgba(34,197,94,0.6);
  }
  100% {
    box-shadow: 
      0 -4px 16px rgba(34,197,94,0.6),
      4px 0 16px rgba(34,197,94,0.2),
      0 4px 16px rgba(34,197,94,0.1),
      -4px 0 16px rgba(34,197,94,0.1);
  }
}

.nav-item.active {
  animation: circularGlow 3.5s linear infinite;
}
```

### 3.4 TV-Specific Keyboard Handlers (Implementation)
```javascript
useEffect(() => {
  if (!isTVMode) return;

  const handleKeyDown = (e) => {
    const focused = document.activeElement;
    const navMenu = document.querySelector('.nav-sidebar');
    const bottomTiles = document.querySelectorAll('.bottom-tile[tabindex="0"]');
    const isInNav = focused?.closest('.nav-sidebar');
    const isInContent = focused?.closest('.bottom-section');

    // GLOBAL: Left arrow always returns to navigation
    if (e.key === 'ArrowLeft' && !isInNav) {
      e.preventDefault();
      const activeItem = navMenu.querySelector('.nav-item.active') || navMenu.querySelector('.nav-item');
      activeItem?.focus();
      return;
    }

    // From navigation: Right arrow moves to content
    if (isInNav && e.key === 'ArrowRight') {
      e.preventDefault();
      const firstTile = bottomTiles[0];
      firstTile?.focus();
      return;
    }

    // In navigation: Up/Down navigates menu items
    if (isInNav && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      const menuItems = Array.from(navMenu.querySelectorAll('.nav-item'));
      const currentIndex = menuItems.indexOf(focused);
      let nextIndex;
      
      if (e.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % menuItems.length;
      } else {
        nextIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
      }
      
      menuItems[nextIndex]?.focus();
      return;
    }

    // In content: Left/Right navigates between bottom tiles
    if (isInContent && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      const tilesArray = Array.from(bottomTiles);
      const currentIndex = tilesArray.indexOf(focused);
      
      if (e.key === 'ArrowRight') {
        const nextIndex = (currentIndex + 1) % tilesArray.length;
        tilesArray[nextIndex]?.focus();
      } else {
        // Left at first tile returns to menu
        if (currentIndex === 0) {
          const activeItem = navMenu.querySelector('.nav-item.active') || navMenu.querySelector('.nav-item');
          activeItem?.focus();
        } else {
          const prevIndex = currentIndex - 1;
          tilesArray[prevIndex]?.focus();
        }
      }
      return;
    }

    // Escape: Return to default focus (active menu item)
    if (e.key === 'Escape') {
      e.preventDefault();
      const activeItem = navMenu.querySelector('.nav-item.active') || navMenu.querySelector('.nav-item');
      activeItem?.focus();
      return;
    }

    // Enter: Activate focused element
    if (e.key === 'Enter') {
      e.preventDefault();
      focused?.click();
      return;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isTVMode]);
```

---

## Phase 4: Mobile Layout (HomeMobile.jsx)

### 4.1 Single Column Design
- [ ] Header section (stacked vertically)
  - "Uto Bloom" title
  - "Monstera • Living Room" subtitle
  - Active device badge below
  - Last updated timestamp
  
- [ ] Status card (full width, smaller height)
  
- [ ] Metric tiles (stacked vertically, full width)
  - Moisture
  - Temperature
  - Battery
  
- [ ] 3D Plant Visualization (280px height, full width)
  
- [ ] Chart tile (full width)
  
- [ ] Bottom navigation bar (fixed at bottom)
  - Health, Details, History icons
  - Touch-friendly (min 44px tap targets)

### 4.2 Mobile Navigation
- [ ] Bottom nav bar fixed position
- [ ] Active state highlighted
- [ ] No focus management (touch-based)

---

## Phase 5: CSS Styling

### 5.1 Color Variables
```css
--blue-brand: #6898ff;
--white-semi: rgba(255,255,255,0.6);
--white-transparent: rgba(255,255,255,0.2);
--shadow-blue: rgba(59,130,246,0.05);
--shadow-orange: rgba(251,146,60,0.05);
--shadow-green: rgba(34,197,94,0.05);
--shadow-purple: rgba(168,85,247,0.3);
--shadow-cyan: rgba(6,182,212,0.3);
--bg-gradient: linear-gradient(127.935deg, rgb(68,68,68) 0%, rgb(0,0,0) 100%);
```

### 5.2 Metro Tile Styling
- [ ] Border radius: 16px (tiles), 24px (status card)
- [ ] Padding: 20px
- [ ] Gaps: 16px (tight), 40px (section spacing), 50px (major sections)
- [ ] Shadows: Match Figma design per tile color
- [ ] Font: Arial, fallback to sans-serif
- [ ] Font sizes: 12px (labels), 14px (body), 16px (headings), 24px (title)

### 5.3 Purple Chart Styling (from Backup)
- [ ] Extract purple gradient background
- [ ] Bubble animation keyframes
- [ ] Chart line color: #7c3aed (purple)
- [ ] Chart fill: rgba(124, 58, 237, 0.1)
- [ ] Glass morphism effect on chart card

### 5.4 Focus States (TV Mode)
- [ ] Golden outline: 3px solid #ffd700
- [ ] Glow shadow: 0 0 15px rgba(255, 215, 0, 0.4)
- [ ] Transition: all 0.2s ease

---

## Phase 6: Data Integration

### 6.1 Wire Up Real Data (usePlantData hook)
- [ ] Status message → `statusConfig.text`
- [ ] Moisture value → `lastReading?.soil_raw` (display with unit or %)
- [ ] Temperature → `lastReading?.temp_c` (display as "22.5°C")
- [ ] Battery → Add to backend/frontend if missing (display as "87%")
- [ ] Last updated → `lastReading?.last_seen` (format as "Last updated HH:MM AM/PM")
- [ ] Plant name → `plant?.common_name` ("Monstera")
- [ ] Plant location → Add location field or hardcode "Living Room"
- [ ] Chart data → `chartData` for moisture trend

### 6.2 Navigation Handlers
- [ ] Health tile → Navigate to `/` (current page, active state)
- [ ] Details tile → Navigate to `/details` (respect TV mode: `?tv=1`)
- [ ] History tile → Navigate to `/history` (respect TV mode: `?tv=1`)
- [ ] Species toggle → Keep existing functionality

---

## Phase 7: Details Page Focus (TV Mode)

### 7.1 Focus Restrictions (Fixed Start on Menu)
- [ ] **Menu ONLY focusable**
- [ ] Default focus: Active menu item (Details)
- [ ] All detail items are display-only
- [ ] No tab stops in content area
- [ ] Arrow Up/Down: Navigate menu only
- [ ] Arrow Right: Does nothing (no content to focus)
- [ ] Predictable navigation: Stays in menu
- [ ] Back button: Returns to Home (fixed start destination)

---

## Phase 8: History Page Focus (TV Mode)

### 8.1 Focus Restrictions (Horizontal Date Selection)
- [ ] **Menu focusable (Vertical Axis)**
  - Default focus: Active menu item (History)
  - Arrow Up/Down: Navigate menu items
  - Arrow Right: Move to date selectors
  
- [ ] **Date Selectors focusable (Horizontal Axis)**
  - Range buttons: 24h, 7d, 30d, etc.
  - Arrow Left/Right: Navigate between date selectors
  - Arrow Left (at first selector): Return to menu
  - Enter: Select date range, update chart
  
- [ ] **Chart display-only (No Focus)**
  - Updates based on selected date range
  - Not focusable, no interaction needed
  
- [ ] **Clear Axis Logic**
  - Vertical axis: Menu navigation
  - Horizontal axis: Date selector navigation
  - Predictable and fast to learn
  
- [ ] **Back button**: Returns to Home (fixed start destination)

---

## Phase 9: Verification & Testing

### 9.1 Desktop Verification (http://localhost:5174/)
- [ ] Open in Chrome
- [ ] Verify layout matches Figma screenshot exactly
- [ ] Check header width equals top section width
- [ ] Confirm all metric tiles display with correct values
- [ ] Verify 3D plant renders in large tile (500px height)
- [ ] Test purple chart displays with animations
- [ ] Click Health, Details, History tiles → verify navigation
- [ ] Check sidebar navigation visual state

### 9.2 TV Mode Verification (http://localhost:5174/?tv=1)
- [ ] Verify identical visual layout to desktop
- [ ] **Test D-pad Navigation Architecture**
  - [ ] Page load: Focus on Health menu item (fixed start)
  - [ ] Arrow Up/Down in menu: Navigate menu items smoothly
  - [ ] Arrow Right from menu: Focus moves to first bottom tile (Health)
  - [ ] Arrow Left/Right in bottom section: Navigate between tiles (horizontal axis)
  - [ ] Arrow Left from first tile: Returns to menu (vertical axis)
  - [ ] Arrow Left from anywhere: Always returns to active menu item
  - [ ] Escape key: Returns to active menu item
  - [ ] Enter key: Activates focused element
  - [ ] Confirm top section NOT focusable (D-pad passes through)
  - [ ] Verify chart tile NOT focusable (no outline on focus attempt)
- [ ] **Test Animated Glow on Active Menu Item**
  - [ ] Green circular glow animates smoothly around Health icon
  - [ ] Animation duration ~3.5 seconds per rotation
  - [ ] Glow moves clockwise in circular pattern
  - [ ] Animation is subtle, not distracting
  - [ ] Only active menu item has animated glow
  - [ ] Inactive items have static gray appearance
- [ ] **Test Focus Visual Feedback**
  - [ ] Golden outline (3px, #ffd700) on focused tiles
  - [ ] Glow shadow on focus: `0 0 15px rgba(255, 215, 0, 0.4)`
  - [ ] Smooth transition on focus change
- [ ] **Test Details Page Navigation**
  - [ ] Focus stays in menu only
  - [ ] Arrow Right does nothing (no content to focus)
  - [ ] Back button returns to Home (fixed start)
- [ ] **Test History Page Navigation**
  - [ ] Vertical axis: Menu navigation (up/down)
  - [ ] Horizontal axis: Date selector navigation (left/right)
  - [ ] Clear separation between axes
  - [ ] Arrow Left from first selector returns to menu
  - [ ] Back button returns to Home (fixed start)
- [ ] **Accessibility & Predictability**
  - [ ] All focusable elements reachable with D-pad
  - [ ] Navigation direction is straightforward
  - [ ] No confusing nested hierarchies
  - [ ] Controls don't overlap with other clickable elements

### 9.3 Mobile Verification (Resize to 375px)
- [ ] Verify single column stacked layout
- [ ] Check all tiles display full width
- [ ] Confirm 280px plant height
- [ ] Test bottom navigation bar
- [ ] Verify touch targets (min 44px)
- [ ] Test navigation between pages

### 9.4 UI Review Checkpoint
**🛑 STOP HERE FOR USER REVIEW**
- [ ] User reviews visual output
- [ ] User approves layout, spacing, colors
- [ ] User confirms functionality

---

## Phase 10: Git Branch & Commit

### 10.1 Create New Branch
- [ ] `git checkout -b feature/metro-ui-redesign`
- [ ] Stage all changed files
- [ ] Commit with message: "feat: Implement Metro UI redesign for Desktop, TV, and Mobile"

### 10.2 Push to Remote (After Approval)
- [ ] `git push -u origin feature/metro-ui-redesign`
- [ ] Wait for user approval before merging

---

## Phase 11: Code Audit

### 11.1 Audit Scan (Generate Report)
- [ ] Scan for unused files in `client/src/`
- [ ] Identify unused hooks in `client/src/hooks/`
- [ ] Find unused variables in components
- [ ] Detect leftover debug code (console.logs, commented blocks)
- [ ] List backup files (e.g., `*_BACKUP.jsx`, `*_WORKING_BACKUP.jsx`)
- [ ] Check for duplicate CSS rules
- [ ] Identify unused imports

### 11.2 Audit Report Creation
- [ ] Create `CODE_AUDIT_REPORT.md` with findings
- [ ] Categorize by severity:
  - **Critical**: Unused files (delete candidates)
  - **Medium**: Unused hooks/functions (refactor candidates)
  - **Low**: Leftover debug code (cleanup)
- [ ] List file paths and line numbers
- [ ] Provide delete/refactor recommendations

### 11.3 Cleanup Execution (User Review First)
**🛑 STOP - User reviews audit report before proceeding**
- [ ] User approves deletions
- [ ] Delete backup files from local
- [ ] Remove unused files
- [ ] Clean up debug code
- [ ] Commit cleanup: "chore: Remove unused files and debug code"

---

## Phase 12: Final Verification

### 12.1 Post-Cleanup Tests
- [ ] Run dev server (verify no import errors)
- [ ] Test all three layouts (Desktop, TV, Mobile)
- [ ] Verify navigation still works
- [ ] Confirm no broken imports
- [ ] Check browser console for errors

### 12.2 Documentation Update
- [ ] Update README.md with new Metro UI info
- [ ] Document TV mode focus behavior
- [ ] Note mobile layout changes

---

## Success Criteria

✅ Desktop layout matches Figma pixel-perfect  
✅ TV mode has correct focus management (top NOT focusable)  
✅ Mobile layout is single-column and touch-friendly  
✅ Purple chart renders with animations  
✅ All navigation works across layouts  
✅ User approves UI  
✅ Code audit completed and approved  
✅ Cleanup executed  
✅ Branch pushed to remote  

---

**End of Plan**
