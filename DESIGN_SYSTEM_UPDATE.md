# 🎨 Design System Update - Figma Integration

**Date**: November 6, 2025  
**Version**: 2.0  
**Source**: [Figma Design System Components](https://www.figma.com/make/gTRqJcsKZOXryKhYaUcJxI/Design-System-Components?node-id=0-1)

---

## ✅ What Changed

### **1. Figma Design System Integration**

The token system has been updated to match your Figma design system, which uses:
- **OKLCH color space** for better perceptual uniformity
- **Light & Dark mode** support
- **Semantic naming** (background, foreground, primary, secondary, etc.)
- **Professional neutral palette** (moving away from purple-heavy theme)

### **2. Token Structure**

```
tokens.css (New Structure)
├── Figma Design System (Light Mode) - DEFAULT
│   ├── Base colors (background, foreground, card, popover)
│   ├── Primary/Secondary colors
│   ├── Muted/Accent colors
│   ├── Destructive colors
│   ├── Border/Input/Ring
│   ├── Chart colors (5 variants)
│   ├── Sidebar colors
│   └── Typography & Border Radius
│
├── Dark Mode Theme (.dark-mode, [data-theme="dark"])
│   └── All above tokens with dark variants
│
├── Legacy Color System (Backward Compatibility)
│   └── Your original purple/blue/cyan tokens (130+ tokens)
│
└── UtoBloom-Specific Extensions
    ├── Plant status colors
    ├── Spacing scale
    ├── Typography extensions
    ├── Shadows
    ├── Animations
    ├── Layout tokens
    ├── Mobile mode overrides
    └── TV mode overrides
```

---

## 📋 Figma Design System Tokens

### **Color Tokens**

#### Light Mode (Default)
```css
--background: #ffffff
--foreground: oklch(0.145 0 0)  /* Near black */
--primary: #030213  /* Dark blue-black */
--secondary: oklch(0.95 0.0058 264.53)  /* Very light blue-gray */
--muted: #ececf0  /* Light gray */
--accent: #e9ebef  /* Slightly darker light gray */
--destructive: #d4183d  /* Red */
--border: rgba(0, 0, 0, 0.1)  /* Subtle black */
```

#### Dark Mode
```css
--background: oklch(0.145 0 0)  /* Very dark */
--foreground: oklch(0.985 0 0)  /* Near white */
--primary: oklch(0.985 0 0)  /* Near white */
--secondary: oklch(0.269 0 0)  /* Dark gray */
--muted: oklch(0.269 0 0)  /* Dark gray */
--accent: oklch(0.269 0 0)  /* Dark gray */
--destructive: oklch(0.396 0.141 25.723)  /* Muted red */
--border: oklch(0.269 0 0)  /* Dark gray */
```

### **Chart Colors**

5 distinct colors for data visualization:
- Light Mode: Warm orange, teal, blue, bright yellow, golden
- Dark Mode: Purple, green, yellow, magenta, coral

### **Sidebar Colors**

Specialized tokens for navigation/sidebar:
- Light Mode: White with subtle accents
- Dark Mode: Dark with purple primary

### **Typography**
```css
--font-size: 16px
--font-weight-medium: 500
--font-weight-normal: 400
```

### **Border Radius**
```css
--radius: 0.625rem (10px)
--radius-sm: 6px
--radius-md: 8px
--radius-lg: 10px
--radius-xl: 14px
```

---

## 🔄 Migration Strategy

### **Phase 1: Non-Breaking (Current)**
✅ **DONE**: Figma tokens added alongside legacy tokens  
✅ **DONE**: Legacy tokens preserved for backward compatibility  
✅ **DONE**: UtoBloom extensions added (spacing, mobile, TV)  

**Result**: Nothing breaks. Old components still work.

### **Phase 2: Component Mapping** (Next Step)
Map Figma tokens to your component needs:

```css
/* Example Mappings */
.plant-card {
  background: var(--card);  /* Use Figma token */
  color: var(--card-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.moisture-good {
  color: var(--status-healthy);  /* Maps to Figma chart-4 */
}

.nav-sidebar {
  background: var(--sidebar);
  color: var(--sidebar-foreground);
}
```

### **Phase 3: Gradual Refactoring**
Replace legacy tokens component-by-component:

**Priority Order**:
1. Navigation (use `--sidebar-*` tokens)
2. Cards (use `--card-*` tokens)
3. Buttons (use `--primary`, `--secondary`, `--destructive`)
4. Status indicators (use `--status-*` mapped tokens)
5. Charts (use `--chart-1` through `--chart-5`)

### **Phase 4: Dark Mode Support**
Add dark mode toggle:
```jsx
// Add to App.jsx or theme provider
const toggleTheme = () => {
  document.documentElement.classList.toggle('dark-mode');
  // or
  document.documentElement.setAttribute('data-theme', 'dark');
}
```

---

## 🎯 Key Differences from Old System

| Aspect | Old System | New Figma System |
|--------|-----------|------------------|
| **Colors** | Purple-focused (#7c3aed) | Neutral with semantic names |
| **Modes** | Single theme | Light + Dark modes |
| **Color Space** | RGB/RGBA | OKLCH (better) |
| **Naming** | `--color-purple-base` | `--primary`, `--accent` |
| **Structure** | Flat list | Hierarchical & semantic |
| **Charts** | No specific colors | 5 dedicated chart colors |
| **Sidebar** | Generic nav tokens | Dedicated sidebar tokens |

---

## 🚀 Benefits of New System

1. **Professional Design**: Neutral palette, modern OKLCH colors
2. **Dark Mode**: Built-in support for light/dark themes
3. **Semantic**: Clear purpose (`--destructive` vs `--color-danger`)
4. **Accessibility**: OKLCH ensures perceptual uniformity
5. **Figma Sync**: Direct mapping to design source
6. **Flexibility**: Can theme the entire app by changing root tokens

---

## 📖 How to Use

### **Option 1: Import Now (Recommended)**
```jsx
// client/src/main.jsx
import './tokens.css'  // Add this line
import './index.css'
import './App.css'
```

**Effect**: All tokens available, but nothing changes visually (legacy tokens still in use)

### **Option 2: Start Fresh Component**
```jsx
// New component using Figma tokens
function PlantCard({ plant }) {
  return (
    <div style={{
      background: 'var(--card)',
      color: 'var(--card-foreground)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-lg)'
    }}>
      <h3 style={{ color: 'var(--primary)' }}>{plant.name}</h3>
      <p style={{ color: 'var(--muted-foreground)' }}>{plant.species}</p>
    </div>
  )
}
```

### **Option 3: Gradual Migration**
Replace one component at a time:
```css
/* Before */
.nav-item {
  background: rgba(255, 255, 255, 0.7);
  color: var(--black);
}

/* After */
.nav-item {
  background: var(--sidebar);
  color: var(--sidebar-foreground);
}
```

---

## ⚠️ Important Notes

1. **Legacy Tokens Preserved**: All 130+ original color tokens still work
2. **No Breaking Changes**: Existing components continue to work
3. **OKLCH Support**: Modern browsers support OKLCH (Chrome 111+, Safari 15.4+, Firefox 113+)
4. **Responsive Overrides**: Mobile and TV modes still use original spacing/typography scales

---

## 🎨 Color Mapping Guide

For migrating components, here's how old colors map to new:

| Old Token | New Figma Token | Notes |
|-----------|----------------|-------|
| `--color-purple-base` | `--primary` (light) or `--sidebar-primary` (dark) | Use for brand elements |
| `--color-white` | `--background` (light) or `--foreground` (dark) | Context-aware |
| `--color-black` | `--foreground` (light) or `--background` (dark) | Inverted in dark mode |
| `--color-text-secondary` | `--muted-foreground` | Subtle text |
| `--color-border` | `--border` | Borders & dividers |
| `--color-success` | `--status-healthy` or `--chart-4` | Green for positive |
| `--color-danger` | `--destructive` | Red for errors |

---

## 🔧 Next Steps

1. ✅ **DONE**: Tokens created from Figma spec
2. **TODO**: Import tokens.css in main.jsx
3. **TODO**: Test in browser (verify OKLCH support)
4. **TODO**: Create theme toggle component (for dark mode)
5. **TODO**: Refactor one component as proof of concept
6. **TODO**: Gradually migrate remaining components
7. **TODO**: Remove legacy tokens when migration complete

---

## 📚 Resources

- **Figma File**: https://www.figma.com/make/gTRqJcsKZOXryKhYaUcJxI/Design-System-Components
- **OKLCH Info**: https://oklch.com/
- **Original Audit**: See `TOKENS_AUDIT.md`
