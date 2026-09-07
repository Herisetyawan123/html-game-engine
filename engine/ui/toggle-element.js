class Toggle extends UIElement {
  constructor(xOrSpec, y, w, h, value, onChange) {
    const isObjectSpec = xOrSpec && typeof xOrSpec === 'object' && !Array.isArray(xOrSpec);
    const spec = isObjectSpec ? xOrSpec : normalizeUIPositionSpec(xOrSpec, y, w, h);
    super(spec.x, spec.y, spec.width, spec.height);
    const options = isObjectSpec ? { ...spec, value, onChange } : { value, onChange };
    this.value = !!options.value; this.onChange = options.onChange;
  }
  draw(ctx) {
    ctx.save();
    roundRect(ctx, this.x, this.y, this.width, this.height, this.height / 2);
    ctx.fillStyle = this.value ? '#22c55e' : '#4b5563';
    ctx.fill();
    const knobX = this.value ? this.x + this.width - this.height / 2 : this.x + this.height / 2;
    ctx.beginPath(); ctx.arc(knobX, this.y + this.height / 2, this.height / 2 - 4, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.restore();
  }
  onPointerDown() { this.value = !this.value; this.onChange && this.onChange(this.value); }
}
