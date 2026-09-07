class Popup extends UIElement {
  constructor(xOrSpec, y, w, h, opts = {}) {
    const isObjectSpec = xOrSpec && typeof xOrSpec === 'object' && !Array.isArray(xOrSpec);
    const spec = isObjectSpec ? xOrSpec : normalizeUIPositionSpec(xOrSpec, y, w, h);
    super(spec.x, spec.y, spec.width, spec.height);
    const options = isObjectSpec ? { ...spec, ...opts } : opts;
    this.panel = new Panel(spec.x, spec.y, spec.width, spec.height, options);
    this.children = [];
  }
  add(el) { this.children.push(el); return el; }
  draw(ctx) {
    if (!this.visible) return;
    this.panel.draw(ctx);
    this.children.forEach(c => c.draw(ctx));
  }
}