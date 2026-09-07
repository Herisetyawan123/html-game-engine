class ProgressBar extends UIElement {
  constructor(xOrSpec, y, w, h, value = 0) {
    const isObjectSpec = xOrSpec && typeof xOrSpec === 'object' && !Array.isArray(xOrSpec);
    const spec = isObjectSpec ? xOrSpec : normalizeUIPositionSpec(xOrSpec, y, w, h);
    super(spec.x, spec.y, spec.width, spec.height);
    const options = isObjectSpec ? { ...spec, value } : { value };
    this.value = clamp(options.value, 0, 1);
  }
  draw(ctx) {
    ctx.save();
    roundRect(ctx, this.x, this.y, this.width, this.height, this.height / 2);
    ctx.fillStyle = '#334155'; ctx.fill();
    roundRect(ctx, this.x, this.y, this.width * this.value, this.height, this.height / 2);
    ctx.fillStyle = '#f59e0b'; ctx.fill();
    ctx.restore();
  }
}