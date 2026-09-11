class ImageButton extends UIElement {
  constructor(opts = {}) {
    const spec = normalizeUIPositionSpec(opts);
    super(spec);
    const options = opts;
    this.assets = options.assets;
    this.key = options.key || options.id || key || '';
    this.src = options.src || options.image || options.imageSrc || null;
    this.opacity = options.opacity !== undefined ? options.opacity : 1;
    this.onclick = options.onClick ?? options.onclick ?? null;
    this.pressed = false;
    this.hovered = false;
  }
  _resolveImage() {
    if (this.src) return this.src;
    if (this.assets && this.key) return this.assets.getImage(this.key);
    return null;
  }
  draw(ctx) {
    if (!this.visible) return;
    const bounds = this.getWorldPosition();
    const img = this._resolveImage();
    if (!img) return;
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.drawImage(img, bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.restore();
  }
  onPointerDown() { this.pressed = true; }
  onPointerUp(x, y, hit) { if (this.pressed && hit && this.onclick) this.onclick(); this.pressed = false; }
}