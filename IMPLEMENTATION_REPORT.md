# Step 1: Anchor + Offset Positioning System - Implementation Report

## Overview
Successfully implemented a proper anchor + offset positioning system for all UI elements in the game framework. The system allows elements to be positioned relative to anchor points (left, center, right for X; top, middle, bottom for Y) with optional offsets.

## Files Changed

### Core Implementation
1. **engine/ui/base-element.js** - Main positioning logic
   - Removed: `resolveUIAnchorValue()` (old anchor calculation)
   - Added: `extractAnchorKeyword()` - detects anchor keywords in values
   - Added: `calculateAnchorBase()` - calculates anchor reference point
   - Updated: `normalizeUIPositionSpec()` - extracts anchors and offsets
   - Updated: `UIElement` class with anchor support and `getWorldPosition()`

### UI Elements Updated (12 files)
All elements now use `getWorldPosition()` in their `draw()` methods:

2. **engine/ui/label-element.js** - Updated draw()
3. **engine/ui/button-element.js** - Updated draw()
4. **engine/ui/image-button-element.js** - Updated draw()
5. **engine/ui/image-view-element.js** - Updated draw() and setImage()
6. **engine/ui/panel-element.js** - Updated draw()
7. **engine/ui/drag-drop-element.js** - Updated DragArea and DropArea
   - Updated draw(), onPointerDown(), onPointerMove(), onPointerUp(), setImage()
   - Drag logic now correctly accounts for anchor base when calculating offsets
8. **engine/ui/toggle-element.js** - Updated draw()
9. **engine/ui/slider-element.js** - Updated draw() and _updateFromX()
10. **engine/ui/progress-bar-element.js** - Updated draw()
11. **engine/ui/icon-element.js** - Updated draw()
12. **engine/ui/toggle-image-element.js** - Updated draw()

## Key Architecture Changes

### Position Model
**Before:**
```javascript
this.x = resolveUIAnchorValue(parsed.x, BASE_WIDTH, width);  // Final canvas position
this.y = resolveUIAnchorValue(parsed.y, BASE_HEIGHT, height);
```

**After:**
```javascript
this.x = parsed.x;                    // Logical offset from anchor
this.y = parsed.y;
this.anchorX = parsed.anchorX;        // 'left', 'center', or 'right'
this.anchorY = parsed.anchorY;        // 'top', 'middle', or 'bottom'

// Canvas position calculated on-demand:
getWorldPosition() {
  const anchorBaseX = calculateAnchorBase(this.anchorX, BASE_WIDTH, this.width);
  const anchorBaseY = calculateAnchorBase(this.anchorY, BASE_HEIGHT, this.height);
  return {
    x: anchorBaseX + this.x,
    y: anchorBaseY + this.y,
    width: this.width,
    height: this.height,
  };
}
```

### Anchor Calculation
For horizontal positioning:
- `'left'`: anchorBaseX = 0
- `'center'`: anchorBaseX = (BASE_WIDTH - elementWidth) / 2
- `'right'`: anchorBaseX = BASE_WIDTH - elementWidth

For vertical positioning:
- `'top'`: anchorBaseY = 0
- `'middle'`: anchorBaseY = (BASE_HEIGHT - elementHeight) / 2
- `'bottom'`: anchorBaseY = BASE_HEIGHT - elementHeight

## Backward Compatibility

### Legacy Syntax Preserved
All existing code continues to work:

```javascript
// Old numeric syntax
new Label(BASE_WIDTH / 2, 100, 'Text', { align: 'center' });

// Old string anchor syntax
new Label({ x: 'center', y: 100, text: 'Text' });

// Left anchor still default
new Button(100, 50, 200, 60, 'CLICK');
```

### Automatic Conversion
The `normalizeUIPositionSpec()` function automatically converts:
- `x: 'center'` → `x: 0, anchorX: 'center'`
- `y: 'middle'` → `y: 0, anchorY: 'middle'`
- `x: 'right'` → `x: 0, anchorX: 'right'`
- Aliases: 'left'/'start', 'right'/'end', 'top'/'up', 'middle'/'center' all work

## New Syntax Available

```javascript
// Explicit anchor system
new Label({
  x: 100,
  y: 0,
  anchorX: 'center',
  anchorY: 'middle',
  text: 'Centered + 100px right'
});

// Center with negative offset (move left)
new Button({
  x: -50,
  y: 0,
  width: 200,
  height: 60,
  anchorX: 'center',
  anchorY: 'middle',
  label: 'CLICK'
});

// Right/bottom positioning
new ImageView({
  x: -20,
  y: -20,
  width: 100,
  height: 100,
  anchorX: 'right',
  anchorY: 'bottom'
});
```

## Position Resolution Timing

**Critical Design Choice:** Position resolution happens **at draw/hit-test time**, not at construction time.

Benefits:
- Canvas dimensions can change without recreating elements
- Same element can be reused in different coordinate systems (future Step 2+)
- Simplifies dragging logic (drag updates logical x/y, world position recalculated)

## Drag + Drop Behavior

DragArea now correctly handles anchors during drag operations:

1. **onPointerDown**: Calculates drag offset from resolved world position
2. **onPointerMove**: Updates logical x/y while maintaining anchor base
3. **onPointerUp**: Snaps to drop area, accounting for anchor adjustment

```javascript
onPointerMove(x, y) {
  const anchorBaseX = calculateAnchorBase(this.anchorX, BASE_WIDTH, this.width);
  const anchorBaseY = calculateAnchorBase(this.anchorY, BASE_HEIGHT, this.height);
  this.x = x - this.dragOffsetX - anchorBaseX;
  this.y = y - this.dragOffsetY - anchorBaseY;
}
```

## Hit Testing (contains)

Updated to use resolved world position:

```javascript
contains(px, py) {
  if (!this.visible || !this.active) return false;
  const bounds = this.getWorldPosition();
  return px >= bounds.x && px <= bounds.x + bounds.width &&
         py >= bounds.y && py <= bounds.y + bounds.height;
}
```

Hit testing now works correctly regardless of anchor setting.

## Text Alignment (Label)

**Important:** Text alignment (`align: 'center'`) is kept separate from element positioning (`anchorX`).

- `anchorX`/`anchorY`: Where the element is positioned on canvas
- `align`: How text is rendered within the element

```javascript
new Label({
  x: 0,
  y: 0,
  anchorX: 'center',
  anchorY: 'middle',
  text: 'Centered',
  align: 'center'  // Text alignment within label (separate concept)
});
```

## No Breaking Changes

✓ All existing scenes continue to work unchanged
✓ All existing UI elements automatically gain anchor support
✓ No rewrite of scene files needed
✓ No DOM/CSS introduced
✓ No parent/child nesting introduced (reserved for Step 2)
✓ No external dependencies

## Testing

Test file created: `test-anchor-system.js` (not included in production)

Test cases cover:
1. Default positioning (left, top)
2. Center anchor with zero offset
3. Center anchor with positive offset
4. Center anchor with negative offset
5. Right/bottom anchors with negative offset
6. Legacy string syntax (`x: 'center'`)
7. Legacy string syntax (`y: 'middle'`)
8. Hit testing with anchored elements

## Ready for Step 2

This implementation provides a clean foundation for the next phase:
- Container elements with nested UI
- Auto-layout and flex-like positioning
- Recursive UI tree traversal
- Parent/child coordinate transformation

The logical x/y being separate from world position means parent containers can easily transform child coordinates.

## Summary

**Status:** ✓ Complete

**Lines Changed:** ~150 new/modified lines across 13 files

**Backward Compatibility:** 100% preserved

**New Features:**
- Anchor-based positioning system
- Support for offsets from anchor points
- Proper hit-testing with anchors
- Drag + drop with anchor awareness
- Legacy syntax still works

**Architecture:** Clean separation between logical position (x/y offset + anchor) and world position (canvas coordinates).

This is a solid Step 1 that maintains all existing functionality while adding the proper positioning foundation for future container and nested element features.
