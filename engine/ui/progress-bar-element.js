class ProgressBar extends UIElement {
  constructor(opts = {}) {
    const spec = normalizeUIPositionSpec(opts);
    super(spec);
    const options = opts;
    this.value = clamp(options.value ?? 0.5, 0, 1);
  }
  draw(ctx) {
    if (!this.visible) return;
    const bounds = this.getWorldPosition();
    ctx.save();
    this.applyRotation(ctx, bounds);
    roundRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, bounds.height / 2);
    ctx.fillStyle = '#334155'; ctx.fill();
    roundRect(ctx, bounds.x, bounds.y, bounds.width * this.value, bounds.height, bounds.height / 2);
    ctx.fillStyle = '#f59e0b'; ctx.fill();
    ctx.restore();
  }
}