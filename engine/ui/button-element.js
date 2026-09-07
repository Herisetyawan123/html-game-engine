class Button extends UIElement {
  constructor(xOrSpec, y, w, h, label, onClick, opts = {}) {
    const isObjectSpec = xOrSpec && typeof xOrSpec === 'object' && !Array.isArray(xOrSpec);
    const spec = isObjectSpec ? xOrSpec : normalizeUIPositionSpec(xOrSpec, y, w, h);
    super(spec.x, spec.y, spec.width, spec.height);
    const options = isObjectSpec ? { ...spec, ...opts } : opts;
    this.label = options.label ?? options.text ?? label ?? '';
    this.onClick = options.onClick ?? options.onclick ?? onClick ?? null;
    this.baseColor = options.color || '#3b82f6';
    this.hoverColor = options.hoverColor || '#2563eb';
    this.textColor = options.textColor || '#ffffff';
    this.font = options.font || '24px sans-serif';
    this.pressed = false;
  }
  draw(ctx) {
    if (!this.visible) return;
    ctx.save();
    roundRect(ctx, this.x, this.y, this.width, this.height, 12);
    ctx.fillStyle = this.pressed ? this.hoverColor : this.baseColor;
    ctx.fill();
    ctx.fillStyle = this.textColor;
    ctx.font = this.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.label, this.x + this.width / 2, this.y + this.height / 2 + 2);
    ctx.restore();
  }
  onPointerDown() { this.pressed = true; }
  onPointerUp(x, y, hit) { if (this.pressed && hit && this.onClick) this.onClick(); this.pressed = false; }
}