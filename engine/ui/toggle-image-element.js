class ToggleImage extends ImageView {
  constructor(opts = {}) {
    const spec = normalizeUIPositionSpec(opts);
    super(spec);
    this.keyOn = opts.keyOn || null;
    this.keyOff = opts.keyOff || null;
    this.value = !!opts.value;
    this.onChange = opts.onChange || null;
  }
  draw(ctx) {
    if (!this.visible) return;
    const bounds = this.getWorldPosition();
    const img = this.assets.getImage(this.value ? this.keyOn : this.keyOff);
    if (!img) return;
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.drawImage(img, bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.restore();
  }
  onPointerDown() { 
    this.value = !this.value; 
    if (this.onChange) this.onChange(this.value); 
  }
}