class Toggle extends UIElement {
  constructor(opts = {}) {
    const spec = normalizeUIPositionSpec(opts);
    super(spec);
    const options = opts;
    this.value = !!options.value; this.onChange = options.onChange ?? null;
  }
  draw(ctx) {
    if (!this.visible) return;
    const bounds = this.getWorldPosition();
    ctx.save();
    this.applyRotation(ctx, bounds);
    roundRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, bounds.height / 2);
    ctx.fillStyle = this.value ? '#22c55e' : '#4b5563';
    ctx.fill();
    const knobX = this.value ? bounds.x + bounds.width - bounds.height / 2 : bounds.x + bounds.height / 2;
    ctx.beginPath(); ctx.arc(knobX, bounds.y + bounds.height / 2, bounds.height / 2 - 4, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.restore();
  }
  onPointerDown() { this.value = !this.value; this.onChange && this.onChange(this.value); }
}
