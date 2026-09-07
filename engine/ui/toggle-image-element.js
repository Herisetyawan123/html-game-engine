class ToggleImage extends ImageView {
  constructor(xOrSpec, y, w, h, assets, keyOn, keyOff, value = false, onChange) {
    const isObjectSpec = xOrSpec && typeof xOrSpec === 'object' && !Array.isArray(xOrSpec);
    const spec = isObjectSpec ? xOrSpec : normalizeUIPositionSpec(xOrSpec, y, w, h);
    const options = isObjectSpec ? { ...spec, assets: spec.assets || assets, keyOn, keyOff, value, onChange } : { assets, keyOn, keyOff, value, onChange };
    super(spec.x, spec.y, spec.width, spec.height, options.assets, value ? keyOn : keyOff, options);
    this.keyOn = options.keyOn || keyOn;
    this.keyOff = options.keyOff || keyOff;
    this.value = !!options.value;
    this.onChange = options.onChange || onChange;
  }
  draw(ctx) {
    if (!this.visible) return;
    const img = this.assets.getImage(this.value ? this.keyOn : this.keyOff);
    if (!img) return;
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.drawImage(img, this.x, this.y, this.width, this.height);
    ctx.restore();
  }
  onPointerDown() { 
    this.value = !this.value; 
    if (this.onChange) this.onChange(this.value); 
  }
}