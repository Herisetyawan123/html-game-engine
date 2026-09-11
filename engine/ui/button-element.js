class Button extends UIElement {
  constructor(opts = {}) {
    const spec = normalizeUIPositionSpec(opts);
    super(spec);
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
    const bounds = this.getWorldPosition();
    ctx.save();
    roundRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, 12);
    ctx.fillStyle = this.pressed ? this.hoverColor : this.baseColor;
    ctx.fill();
    ctx.fillStyle = this.textColor;
    ctx.font = this.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.label, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2 + 2);
    ctx.restore();
  }
  onPointerDown() { this.pressed = true; }
  onPointerUp(x, y, hit) { if (this.pressed && hit && this.onClick) this.onClick(); this.pressed = false; }
}