class Icon extends UIElement {
  constructor(xOrSpec, y, w, h, drawFn) {
    const isObjectSpec = xOrSpec && typeof xOrSpec === 'object' && !Array.isArray(xOrSpec);
    const spec = isObjectSpec ? xOrSpec : normalizeUIPositionSpec(xOrSpec, y, w, h);
    super(spec.x, spec.y, spec.width, spec.height);
    const options = isObjectSpec ? { ...spec, drawFn } : { drawFn };
    this.drawFn = options.drawFn;
  }
  draw(ctx) { if (this.drawFn) this.drawFn(ctx, this.x, this.y, this.width, this.height); }
}