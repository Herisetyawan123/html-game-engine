class ProgressBar extends UIElement {
  constructor(xOrSpec, y, w, h, value = 0) {
    const isObjectSpec = xOrSpec && typeof xOrSpec === 'object' && !Array.isArray(xOrSpec);
    const spec = isObjectSpec ? xOrSpec : normalizeUIPositionSpec(xOrSpec, y, w, h);
    super(spec.x, spec.y, spec.width, spec.height);
    const options = isObjectSpec ? { ...spec, value } : { value };
    this.value = clamp(options.value, 0, 1);
  }
  draw(ctx) {
    const bounds = this.getWorldPosition();
    ctx.save();
    roundRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, bounds.height / 2);
    ctx.fillStyle = '#334155'; ctx.fill();
    roundRect(ctx, bounds.x, bounds.y, bounds.width * this.value, bounds.height, bounds.height / 2);
    ctx.fillStyle = '#f59e0b'; ctx.fill();
    ctx.restore();
  }
}