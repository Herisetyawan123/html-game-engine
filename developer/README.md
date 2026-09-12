# Developer Page / Scene Builder - Step A

## Overview

The Developer Page is a separate tool for developers to visually configure scenes without manually writing UI positioning code.

**Step A** implements the foundation:
- Asset Browser with automatic asset loading
- Canvas Preview area
- Asset selection interface

## File Structure

```
developer/
├── index.html         # Developer Page HTML entry point
├── styles.css         # Styling and layout
├── developer.js       # Main Developer Page logic
└── README.md          # This file
```

## How to Use

### Opening Developer Page

1. Navigate to `/developer/index.html` in your browser
2. The page will automatically load all assets from `window.__ASSETS_PACK__.images`
3. Assets will appear in the sidebar as a grid of thumbnails

### Asset Browser

- **View Assets**: Thumbnails display the actual base64-encoded images from the asset pack
- **Search Assets**: Use the search box to filter by asset name (case-insensitive)
- **Select Asset**: Click an asset to select it
- **Visual Indicator**: Selected asset highlights with blue border

### Canvas Preview

- **Resolution**: 1280×720 (matching game engine BASE_WIDTH/BASE_HEIGHT)
- **Grid**: Background grid helps with positioning visualization
- **Currently**: Shows placeholder text (Step A only)

## How It Works

### Asset Loading

The Developer Page consumes the existing asset pack without modification:

```javascript
// From assets/asset.pack.js
window.__ASSETS_PACK__ = {
  images: {
    "bg": "data:image/png;base64,...",
    "car": "data:image/jpeg;base64,...",
    ...
  }
};
```

The `DeveloperPage` class reads `window.__ASSETS_PACK__.images` and creates thumbnail elements.

### Asset Selection

When you click an asset:

1. The asset key is stored in `window.devPage.selectedAssetKey`
2. Visual selection state updates
3. Selected asset info appears in the "Selected" panel
4. Can be accessed via `window.devPage.getSelectedAsset()`

## Error Handling

- **Missing Asset Pack**: Shows error message if `window.__ASSETS_PACK__` is not found
- **Missing Images**: Shows error message if `.images` is empty
- **Failed Thumbnails**: If individual images fail to load, they are skipped gracefully

## Integration with Existing Game

**No existing game files are modified.**

The Developer Page:
- Loads the same `assets/asset.pack.js` as the game
- Does NOT modify the asset pack
- Does NOT affect the game runtime
- Can coexist with the game on the same server

## Step A Limitations (By Design)

❌ **Not Yet Implemented:**
- Property editor (x, y, width, height, anchorX, anchorY, etc.)
- Element browser (Label, Button, ImageView, etc.)
- Drag-and-drop positioning
- Container/nesting support
- JavaScript scene generator
- UI element registry
- Auto-save/load

## Future Steps (Architecture Ready)

### Step B: Property Editor
Add fields to edit:
- Position (x, y)
- Size (width, height)
- Anchor (anchorX, anchorY)
- Additional properties per element type

### Step C: Element Browser
Add UI element selection:
- Label
- Button
- ImageView
- ImageButton
- Panel
- Slider
- Toggle
- etc.

### Step D: Scene Generator
Auto-generate JavaScript scene code from visual configuration

### Step E: Nesting & Containers
Support parent-child relationships, auto-layout, padding

## API Reference

### DeveloperPage Class

```javascript
// Get reference to developer page
const dev = window.devPage;

// Properties
dev.selectedAssetKey      // Currently selected asset key (string or null)
dev.assets                // All available assets (object)
dev.filteredAssets        // Currently filtered assets (array)

// Methods
dev.selectAsset(key)      // Programmatically select an asset
dev.getSelectedAsset()    // Returns { key, src } or null
dev.renderAssets(keys)    // Re-render assets list
```

### Example Usage

```javascript
// Get selected asset
const selected = window.devPage.getSelectedAsset();
if (selected) {
  console.log(`Selected: ${selected.key}`);
  console.log(`Source: ${selected.src}`);
}

// Select asset programmatically
window.devPage.selectAsset('car');

// Access asset data
const allAssets = window.devPage.assets;
console.log(Object.keys(allAssets)); // All asset keys
```

## Testing Checklist

- [x] Developer Page loads without errors
- [x] Asset pack is correctly detected
- [x] All asset thumbnails display
- [x] Search/filter works
- [x] Asset selection works
- [x] Visual selection state shows
- [x] Selected asset info displays
- [x] Existing game still works (not modified)
- [x] No console errors
- [x] Responsive layout works

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES6 support
- Requires canvas support
- Requires data URL support for base64 images

## Performance Notes

- Asset pack contains base64-encoded images (already in memory)
- No external network requests needed
- Thumbnail rendering happens on-demand
- Search is instant (client-side filtering)
- Scales to hundreds of assets without performance issues

## Debug Console

Open browser DevTools console to see:
- Developer Page initialization logs
- Asset count
- Selection logs
- Error messages

```javascript
// In console:
window.devPage                  // DeveloperPage instance
window.__ASSETS_PACK__.images   // All assets
window.devPage.selectedAssetKey // Current selection
```

## Notes for Future Development

1. **Keep Separation**: Keep Developer Page isolated from game engine
2. **Reuse Asset Pack**: Don't duplicate or convert assets
3. **Base64 Usage**: Don't decode base64 unnecessarily (already valid image source)
4. **Canvas Dimensions**: Always use BASE_WIDTH/BASE_HEIGHT from config
5. **No Drag-Drop Yet**: Keep interactions simple (click-select)
6. **Modular Design**: Each step should be independently testable

---

**Developer Page v1.0 - Step A Complete**

Last Updated: 2026-09-12
