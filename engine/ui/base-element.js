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
    case 'middle':
      return (baseSize - elementSize) / 2;
    case 'right':
    case 'bottom':
    case 'end':
      return baseSize - elementSize;
    case 'left':
    case 'top':
    case 'start':
    default:
      return 0;
  }
}

function normalizeUIPositionSpec(param) {
  if (param && typeof param === 'object' && !Array.isArray(param)) {
    const spec = param;
    
    // Extract x value and determine anchorX
    const xVal = spec.x ?? spec.left ?? spec.start;
    const anchorXKeyword = extractAnchorKeyword(xVal);
    const x = anchorXKeyword ? 0 : (xVal ?? 0);
    
    // Extract y value and determine anchorY
    const yVal = spec.y ?? spec.top ?? spec.up;
    // console.log('yVal:', yVal)
    const anchorYKeyword = extractAnchorKeyword(yVal);
    const y_coord = anchorYKeyword ? 0 : (yVal ?? 0);
    // console.log(y_coord, anchorYKeyword, yVal)
    
    // Also check if anchorX/anchorY properties contain keywords
    const explicitAnchorX = spec.anchorX ? extractAnchorKeyword(spec.anchorX) : null;
    const explicitAnchorY = spec.anchorY ? extractAnchorKeyword(spec.anchorY) : null;
    return {
      ...spec,
      x,
      y: y_coord,
      anchorX: explicitAnchorX ?? spec.anchorX ?? anchorXKeyword ?? 'left',
      anchorY: explicitAnchorY ?? spec.anchorY ?? anchorYKeyword ?? 'top',
      width: spec.width ?? spec.w ?? spec.size ?? 0,
      height: spec.height ?? spec.h ?? spec.size ?? 0,
       // Include any other properties for flexibility
    };
  }else{
    // If param is not an object, treat it as x coordinate and use defaults for others
    return {
      x: param ?? 0,
      y: 0,
      anchorX: 'left',
      anchorY: 'top',
      width: 0,
      height: 0,
    };
  }
}

class UIElement {
  constructor(param) {
    const parsed = normalizeUIPositionSpec(param);
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
    
    // Rotation in degrees (clockwise). Aliases: rotation, angle, rot.
    this.rotate = parsed.rotate ?? parsed.rotation ?? parsed.angle ?? parsed.rot ?? 0;
    // Pivot point as normalized 0..1 within element bounds (default center).
    // Can be overridden via pivotX/pivotY or rotateOrigin ('center', 'top left', etc).
    const pivotFromOrigin = UIElement.parseRotateOrigin(parsed.rotateOrigin ?? parsed.transformOrigin ?? parsed.origin ?? null);
    this.pivotX = parsed.pivotX ?? parsed.pivot?.x ?? pivotFromOrigin?.x ?? 0.5;
    this.pivotY = parsed.pivotY ?? parsed.pivot?.y ?? pivotFromOrigin?.y ?? 0.5;
    
    this.key = parsed.key || parsed.id || null;
    this.visible = true;
    this.active = true;
  }

  static parseRotateOrigin(origin) {
    if (!origin || typeof origin !== 'string') return null;
    const s = origin.trim().toLowerCase();
    if (s === 'center' || s === 'middle' || s === 'centre') return { x: 0.5, y: 0.5 };
    let x = 0.5, y = 0.5;
    if (s.includes('left') || s.includes('start')) x = 0;
    if (s.includes('right') || s.includes('end')) x = 1;
    if (s.includes('top') || s.includes('up')) y = 0;
    if (s.includes('bottom') || s.includes('down')) y = 1;
    if (s === 'top' || s === 'up') x = 0.5;
    if (s === 'bottom' || s === 'down') x = 0.5;
    if (s === 'left' || s === 'start') y = 0.5;
    if (s === 'right' || s === 'end') y = 0.5;
    return { x, y };
  }

  getRotationRadians() {
    const deg = Number(this.rotate) || 0;
    return deg * Math.PI / 180;
  }

  getRotationPivot(bounds) {
    const b = bounds || this.getWorldPosition();
    return {
      x: b.x + b.width * (Number(this.pivotX) || 0),
      y: b.y + b.height * (Number(this.pivotY) || 0),
    };
  }

  /** Apply rotation transform to ctx. Must be called after ctx.save(). No-op when rotate is 0. */
  applyRotation(ctx, bounds) {
    const rad = this.getRotationRadians();
    if (!rad) return;
    const pivot = this.getRotationPivot(bounds);
    ctx.translate(pivot.x, pivot.y);
    ctx.rotate(rad);
    ctx.translate(-pivot.x, -pivot.y);
  }

  setRotation(deg) { this.rotate = deg; return this; }
  setPivot(px, py) { this.pivotX = px; this.pivotY = py; return this; }
  setRotateOrigin(origin) {
    const p = UIElement.parseRotateOrigin(origin);
    if (p) { this.pivotX = p.x; this.pivotY = p.y; }
    return this;
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
    const rad = this.getRotationRadians();
    if (rad) {
      // Inverse-rotate the point around the pivot back to unrotated space.
      const pivot = this.getRotationPivot(bounds);
      const dx = px - pivot.x;
      const dy = py - pivot.y;
      const cos = Math.cos(-rad);
      const sin = Math.sin(-rad);
      px = pivot.x + dx * cos - dy * sin;
      py = pivot.y + dx * sin + dy * cos;
    }
    return px >= bounds.x && px <= bounds.x + bounds.width &&
           py >= bounds.y && py <= bounds.y + bounds.height;
  }
  
  draw(ctx) {}
  onPointerDown() {}
  onPointerUp() {}
  onPointerMove() {}
}
