
class Label extends UIElement {
  constructor(xOrSpec, y, text, opts = {}) {
    const isObjectSpec = xOrSpec && typeof xOrSpec === 'object' && !Array.isArray(xOrSpec);
    const spec = isObjectSpec ? xOrSpec : { x: xOrSpec, y, text, ...opts };
    const options = isObjectSpec ? { ...spec, ...opts } : opts;
    super(spec);
    this.text = options.text ?? options.label ?? text ?? '';
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