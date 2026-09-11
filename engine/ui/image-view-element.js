class ImageView extends UIElement {
  constructor(opts = {}) {
    const spec = normalizeUIPositionSpec(opts);
    super(spec);
    const options = opts;
    this.assets = options.assets;
    this.key = options.key || options.id || null;
    this.src = options.src || options.image || options.imageSrc || null;
    this.opacity = options.opacity !== undefined ? options.opacity : 1;
    this._errorMessage = null;
  }
  _isValidImage(img) {
    if (!img) return false;
    const validTypes = [HTMLImageElement, HTMLCanvasElement, HTMLVideoElement, ImageBitmap, OffscreenCanvas];
    if (typeof SVGImageElement !== 'undefined') validTypes.push(SVGImageElement);
    if (typeof VideoFrame !== 'undefined') validTypes.push(VideoFrame);
    return validTypes.some(t => img instanceof t);
  }
  _resolveImage() {
    if (!this.src) {
      this._errorMessage = 'No source';
      return null;
    }
    if (typeof this.src === 'string' && this.assets) {
      const img = this.assets.getImage(this.src);
      if (!this._isValidImage(img)) {
        this._errorMessage = `Failed: "${this.src}"`;
        return null;
      }
      return img;
    }
    if (this._isValidImage(this.src)) {
      this._errorMessage = null;
      return this.src;
    }else if(this.assets){
      const img = this.assets.getImage(this.src);
      if (!this._isValidImage(img)) {
        this._errorMessage = `Failed: "${this.src}"`;
        return null;
      }
      return img;
    }
    this._errorMessage = 'Invalid type';
    return null;
  }
  draw(ctx) {
    if (!this.visible) return;
    const bounds = this.getWorldPosition();
    const img = this._resolveImage();
    ctx.save();
    if (img) {
      ctx.globalAlpha = this.opacity;
      ctx.drawImage(img, bounds.x, bounds.y, bounds.width, bounds.height);
    } else {
      // Draw error placeholder with message
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      // Draw X cross
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bounds.x + 5, bounds.y + 5);
      ctx.lineTo(bounds.x + bounds.width - 5, bounds.y + bounds.height - 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bounds.x + bounds.width - 5, bounds.y + 5);
      ctx.lineTo(bounds.x + 5, bounds.y + bounds.height - 5);
      ctx.stroke();
      // Draw text
      ctx.fillStyle = '#ef4444';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this._errorMessage || 'No Image', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2 + 25);
    }
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