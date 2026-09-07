/* =================================== UI Components =================================== */
function resolveUIAnchorValue(value, baseSize, size = 0) {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'center' || normalized === 'middle') return (baseSize - size) / 2;
    if (normalized === 'start' || normalized === 'left' || normalized === 'top' || normalized === 'up') return 0;
    if (normalized === 'end' || normalized === 'right' || normalized === 'bottom') return baseSize - size;
  }
  return value;
}

function normalizeUIPositionSpec(xOrSpec, y, w, h) {
  if (xOrSpec && typeof xOrSpec === 'object' && !Array.isArray(xOrSpec)) {
    const spec = xOrSpec;
    return {
      x: spec.x ?? spec.left ?? spec.start ?? 0,
      y: spec.y ?? spec.top ?? spec.up ?? 0,
      width: spec.width ?? spec.w ?? spec.size ?? w ?? 0,
      height: spec.height ?? spec.h ?? spec.size ?? h ?? 0,
    };
  }
  return { x: xOrSpec, y, width: w, height: h };
}

class UIElement {
  constructor(x, y, w, h) {
    const parsed = normalizeUIPositionSpec(x, y, w, h);
    const width = parsed.width ?? 0;
    const height = parsed.height ?? 0;
    this.x = resolveUIAnchorValue(parsed.x, BASE_WIDTH, width);
    this.y = resolveUIAnchorValue(parsed.y, BASE_HEIGHT, height);
    this.width = width;
    this.height = height;
    this.key = parsed.key || parsed.id || null;
    this.visible = true; this.active = true;
  }
  contains(px, py) {
    return this.visible && this.active &&
           px >= this.x && px <= this.x + this.width &&
           py >= this.y && py <= this.y + this.height;
  }
  draw(ctx) {}
  onPointerDown() {}
  onPointerUp() {}
  onPointerMove() {}
}
