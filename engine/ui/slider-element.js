class Slider extends UIElement {
  constructor(xOrSpec, y, w, h, value, onChange) {
    const isObjectSpec = xOrSpec && typeof xOrSpec === 'object' && !Array.isArray(xOrSpec);
    const spec = isObjectSpec ? xOrSpec : normalizeUIPositionSpec(xOrSpec, y, w, h);
    super(spec.x, spec.y, spec.width, spec.height);
    const options = isObjectSpec ? { ...spec, value, onChange } : { value, onChange };
    this.value = clamp(options.value, 0, 1); this.onChange = options.onChange; this.dragging = false;
  }
  draw(ctx) {
    ctx.save();
    roundRect(ctx, this.x, this.y + this.height / 2 - 4, this.width, 8, 4);
    ctx.fillStyle = '#374151'; ctx.fill();
    roundRect(ctx, this.x, this.y + this.height / 2 - 4, this.width * this.value, 8, 4);
    ctx.fillStyle = '#3b82f6'; ctx.fill();
    const knobX = this.x + this.width * this.value;
    ctx.beginPath(); ctx.arc(knobX, this.y + this.height / 2, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.restore();
  }
  _updateFromX(px) { this.value = clamp((px - this.x) / this.width, 0, 1); this.onChange && this.onChange(this.value); }
  onPointerDown(x) { this.dragging = true; this._updateFromX(x); }
  onPointerMove(x, y, hit) { if (this.dragging) this._updateFromX(x); }
  onPointerUp() { this.dragging = false; }
}
