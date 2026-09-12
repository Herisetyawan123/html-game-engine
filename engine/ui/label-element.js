
class Label extends UIElement {
  constructor(opts = {}) {
    const spec = opts;
    const options = opts;
    super(spec);
    this.key = options.key ?? null;
    this.text = options.text ?? options.label ?? '';
    this.font = options.font || '24px sans-serif';
    this.color = options.color || '#e5e7eb';
    this.align = options.align || 'left';
  }
  draw(ctx) {
    if (!this.visible) return;
    const bounds = this.getWorldPosition();
    ctx.save();
    ctx.font = this.font; 
    ctx.fillStyle = this.color;
    ctx.textAlign = this.align; 
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, bounds.x, bounds.y);
    ctx.restore();
  }
}