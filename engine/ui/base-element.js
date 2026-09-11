/* =================================== UI Components =================================== */

/**
 * Extract anchor keyword from a position value.
 * Returns null if the value is numeric or doesn't match an anchor keyword.
 */
function extractAnchorKeyword(value) {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'center' || normalized === 'middle') return 'center';
    if (normalized === 'start' || normalized === 'left' || normalized === 'top' || normalized === 'up') return 'left';
    if (normalized === 'end' || normalized === 'right' || normalized === 'bottom') return 'right';
  }
  return null;
}

/**
 * Calculate the anchor base position (before offset is applied).
 * For a given anchor keyword and reference space size, returns the reference point.
 */
function calculateAnchorBase(anchor, baseSize, elementSize) {
  switch (anchor) {
    case 'center':
      return (baseSize - elementSize) / 2;
    case 'right':
      return baseSize - elementSize;
    case 'left':
    default:
      return 0;
  }
}

function normalizeUIPositionSpec(xOrSpec, y, w, h) {
  if (xOrSpec && typeof xOrSpec === 'object' && !Array.isArray(xOrSpec)) {
    const spec = xOrSpec;
    
    // Extract x value and determine anchorX
    const xVal = spec.x ?? spec.left ?? spec.start;
    const anchorXKeyword = extractAnchorKeyword(xVal);
    const x = anchorXKeyword ? 0 : (xVal ?? 0);
    
    // Extract y value and determine anchorY
    const yVal = spec.y ?? spec.top ?? spec.up;
    const anchorYKeyword = extractAnchorKeyword(yVal);
    const y_coord = anchorYKeyword ? 0 : (yVal ?? 0);
    
    // Also check if anchorX/anchorY properties contain keywords
    const explicitAnchorX = spec.anchorX ? extractAnchorKeyword(spec.anchorX) : null;
    const explicitAnchorY = spec.anchorY ? extractAnchorKeyword(spec.anchorY) : null;
    
    return {
      x,
      y: y_coord,
      anchorX: explicitAnchorX ?? spec.anchorX ?? anchorXKeyword ?? 'left',
      anchorY: explicitAnchorY ?? spec.anchorY ?? anchorYKeyword ?? 'top',
      width: spec.width ?? spec.w ?? spec.size ?? w ?? 0,
      height: spec.height ?? spec.h ?? spec.size ?? h ?? 0,
    };
  }
  
  // Legacy numeric syntax - check if y is a position keyword
  const anchorYKeyword = extractAnchorKeyword(y);
  return {
    x: xOrSpec ?? 0,
    y: anchorYKeyword ? 0 : (y ?? 0),
    anchorX: 'left',
    anchorY: anchorYKeyword ?? 'top',
    width: w ?? 0,
    height: h ?? 0,
  };
}

class UIElement {
  constructor(x, y, w, h) {
    const parsed = normalizeUIPositionSpec(x, y, w, h);
    const width = parsed.width ?? 0;
    const height = parsed.height ?? 0;
    
    // Store logical position (offset from anchor)
    this.x = parsed.x;
    this.y = parsed.y;
    
    // Store anchor points
    this.anchorX = parsed.anchorX || 'left';
    this.anchorY = parsed.anchorY || 'top';
    
    // Store dimensions
    this.width = width;
    this.height = height;
    
    this.key = parsed.key || parsed.id || null;
    this.visible = true;
    this.active = true;
  }
  
  /**
   * Calculate the world position (canvas coordinates) based on anchor and offset.
   * Returns an object with x, y, width, height.
   */
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
  
  contains(px, py) {
    if (!this.visible || !this.active) return false;
    const bounds = this.getWorldPosition();
    return px >= bounds.x && px <= bounds.x + bounds.width &&
           py >= bounds.y && py <= bounds.y + bounds.height;
  }
  
  draw(ctx) {}
  onPointerDown() {}
  onPointerUp() {}
  onPointerMove() {}
}
