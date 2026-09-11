class Icon extends UIElement {
  constructor(xOrSpec, y, w, h, drawFn) {
    const isObjectSpec = xOrSpec && typeof xOrSpec === 'object' && !Array.isArray(xOrSpec);
    const spec = isObjectSpec ? xOrSpec : normalizeUIPositionSpec(xOrSpec, y, w, h);
    super(spec.x, spec.y, spec.width, spec.height);
    const options = isObjectSpec ? { ...spec, drawFn } : { drawFn };
    this.drawFn = options.drawFn;
  }
  draw(ctx) {
    if (this.drawFn) {
      const bounds = this.getWorldPosition();
      this.drawFn(ctx, bounds.x, bounds.y, bounds.width, bounds.height);
    }
  }
}