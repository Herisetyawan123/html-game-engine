class Panel extends UIElement {
  constructor(opts = {}) {
    const spec = normalizeUIPositionSpec(opts);
    super(spec);
    const options = opts;
    this.color = options.color || 'rgba(20,20,30,0.92)';
    this.radius = options.radius !== undefined ? options.radius : 16;
    this.stroke = options.stroke || '#475569';
  }
  draw(ctx) {
    if (!this.visible) return;
    const bounds = this.getWorldPosition();
    ctx.save();
    roundRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, this.radius);
    ctx.fillStyle = this.color; ctx.fill();
    ctx.strokeStyle = this.stroke; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }
}
