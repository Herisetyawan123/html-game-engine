class Icon extends UIElement {
  constructor(opts = {}) {
    const spec = normalizeUIPositionSpec(opts);
    super(spec);
    this.drawFn = opts.drawFn;
  }
  draw(ctx) {
    if (!this.visible) return;
    if (this.drawFn) {
      const bounds = this.getWorldPosition();
      ctx.save();
      this.applyRotation(ctx, bounds);
      this.drawFn(ctx, bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.restore();
    }
  }
}