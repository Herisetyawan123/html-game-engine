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
    const bounds = this.getWorldPosition();
    ctx.save();
    this.applyRotation(ctx, bounds);
    // Panel already shares the same rotate value — skip its own rotation to avoid double-rotate.
    const panelRot = this.panel.rotate;
    this.panel.rotate = 0;
    this.panel.draw(ctx);
    this.panel.rotate = panelRot;
    this.children.forEach(c => c.draw(ctx));
    ctx.restore();
  }
}