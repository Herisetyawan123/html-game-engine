class ImageView extends UIElement {
  constructor(opts = {}) {
    const spec = normalizeUIPositionSpec(opts);
    super(spec);
    const options = opts;
    this.assets = options.assets;
    this.key = options.key || options.id || null;
    this.src = options.src || options.image || options.imageSrc || null;
    this.opacity = options.opacity !== undefined ? options.opacity : 1;
  }
  _resolveImage() {
    if (!this.src) return null;
    if (typeof this.src === 'string' && this.assets) return this.assets.getImage(this.src);
    return this.src;
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
  setImage(src, opt = {}) {
    this.src = src;
    if (!opt || typeof opt !== 'object' || Array.isArray(opt)) return;

    const { xOrSpec, y, w, h, width, height, opacity } = opt;
    const hasPositionConfig = xOrSpec !== undefined || y !== undefined || w !== undefined || h !== undefined || width !== undefined || height !== undefined;
    if (hasPositionConfig) {
      const spec = normalizeUIPositionSpec(xOrSpec !== undefined ? xOrSpec : opt, y, w ?? width, h ?? height);
      this.x = spec.x;
      this.y = spec.y;
      this.anchorX = spec.anchorX;
      this.anchorY = spec.anchorY;
      this.width = spec.width ?? this.width;
      this.height = spec.height ?? this.height;
    }

    if (opacity !== undefined) {
      this.opacity = opacity;
    }
  }  // ganti gambar saat runtime
}