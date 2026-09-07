class ImageView extends UIElement {
  constructor(xOrSpec, y, w, h, assets, key, opts = {}) {
    const isObjectSpec = xOrSpec && typeof xOrSpec === 'object' && !Array.isArray(xOrSpec);
    const spec = isObjectSpec ? xOrSpec : normalizeUIPositionSpec(xOrSpec, y, w, h);
    super(spec.x, spec.y, spec.width, spec.height);
    const options = isObjectSpec ? { ...spec, ...opts } : opts;
    this.assets = options.assets || assets;
    this.key = options.key || options.id || key || '';
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
    const img = this._resolveImage();
    if (!img) return;
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.drawImage(img, this.x, this.y, this.width, this.height);
    ctx.restore();
  }
  setImage(src, opt = {}) {
    this.src = src;
    if (!opt || typeof opt !== 'object' || Array.isArray(opt)) return;

    const { xOrSpec, y, w, h, width, height, opacity } = opt;
    const hasPositionConfig = xOrSpec !== undefined || y !== undefined || w !== undefined || h !== undefined || width !== undefined || height !== undefined;
    if (hasPositionConfig) {
      const spec = normalizeUIPositionSpec(xOrSpec !== undefined ? xOrSpec : opt, y, w ?? width, h ?? height);
      this.x = resolveUIAnchorValue(spec.x, BASE_WIDTH, spec.width ?? this.width);
      this.y = resolveUIAnchorValue(spec.y, BASE_HEIGHT, spec.height ?? this.height);
      this.width = spec.width ?? this.width;
      this.height = spec.height ?? this.height;
    }

    if (opacity !== undefined) {
      this.opacity = opacity;
    }
  }  // ganti gambar saat runtime
}