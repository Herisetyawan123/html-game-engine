class Popup extends UIElement {
  constructor(opts = {}) {
    const spec = normalizeUIPositionSpec(opts);
    super(spec);
    this.panel = new Panel(spec);
    this.children = [];
  }
  add(el) { this.children.push(el); return el; }
  draw(ctx) {
    if (!this.visible) return;
    this.panel.draw(ctx);
    this.children.forEach(c => c.draw(ctx));
  }
}