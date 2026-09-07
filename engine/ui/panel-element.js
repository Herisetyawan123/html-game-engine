class Panel extends UIElement {
  constructor(xOrSpec, y, w, h, opts = {}) {
    const isObjectSpec = xOrSpec && typeof xOrSpec === 'object' && !Array.isArray(xOrSpec);
    const spec = isObjectSpec ? xOrSpec : normalizeUIPositionSpec(xOrSpec, y, w, h);
    super(spec.x, spec.y, spec.width, spec.height);
    const options = isObjectSpec ? { ...spec, ...opts } : opts;
    this.color = options.color || 'rgba(20,20,30,0.92)';
    this.radius = options.radius !== undefined ? options.radius : 16;
    this.stroke = options.stroke || '#475569';
  }
  draw(ctx) {
    if (!this.visible) return;
    ctx.save();
    roundRect(ctx, this.x, this.y, this.width, this.height, this.radius);
    ctx.fillStyle = this.color; ctx.fill();
    ctx.strokeStyle = this.stroke; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }
}
