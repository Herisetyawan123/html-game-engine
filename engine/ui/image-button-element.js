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
      // Draw error placeholder with button styling
      ctx.fillStyle = this.pressed ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.2)';
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
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this._errorMessage || 'No Image', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2 + 18);
    }
    ctx.restore();
  }
  onPointerDown() { this.pressed = true; }
  onPointerUp(x, y, hit) { if (this.pressed && hit && this.onclick) this.onclick(); this.pressed = false; }
}