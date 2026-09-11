class Icon extends UIElement {
  constructor(opts = {}) {
    const spec = normalizeUIPositionSpec(opts);
    super(spec);
    this.drawFn = opts.drawFn;
  }
  draw(ctx) {
    if (this.drawFn) {
      const bounds = this.getWorldPosition();
      this.drawFn(ctx, bounds.x, bounds.y, bounds.width, bounds.height);
    }
  }
}