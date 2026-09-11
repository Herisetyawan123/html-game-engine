class Slider extends UIElement {
  constructor(opts = {}) {
    const spec = normalizeUIPositionSpec(opts);
    super(spec);
    const options = opts;
    this.value = clamp(options.value, 0, 1); this.onChange = options.onChange; this.dragging = false;
  }
  draw(ctx) {
    const bounds = this.getWorldPosition();
    ctx.save();
    roundRect(ctx, bounds.x, bounds.y + bounds.height / 2 - 4, bounds.width, 8, 4);
    ctx.fillStyle = '#374151'; ctx.fill();
    roundRect(ctx, bounds.x, bounds.y + bounds.height / 2 - 4, bounds.width * this.value, 8, 4);
    ctx.fillStyle = '#3b82f6'; ctx.fill();
    const knobX = bounds.x + bounds.width * this.value;
    ctx.beginPath(); ctx.arc(knobX, bounds.y + bounds.height / 2, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.restore();
  }
  _updateFromX(px) {
    const bounds = this.getWorldPosition();
    this.value = clamp((px - bounds.x) / bounds.width, 0, 1);
    this.onChange && this.onChange(this.value);
  }
  onPointerDown(x) { this.dragging = true; this._updateFromX(x); }
  onPointerMove(x, y, hit) { if (this.dragging) this._updateFromX(x); }
  onPointerUp() { this.dragging = false; }
}
