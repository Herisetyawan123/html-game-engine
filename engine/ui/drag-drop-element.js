class DragArea extends UIElement {
  constructor(xOrSpec, y, w, h, opts = {}) {
    const isObjectSpec = xOrSpec && typeof xOrSpec === 'object' && !Array.isArray(xOrSpec);
    const spec = isObjectSpec ? xOrSpec : normalizeUIPositionSpec(xOrSpec, y, w, h);
    super(spec.x, spec.y, spec.width, spec.height);
    const options = isObjectSpec ? { ...spec, ...opts } : opts;

    this.assets = options.assets || null;
    this.image = options.image || options.backgroundImage || options.background || options.src || null;
    this.imageKey = options.imageKey || options.bgImageKey || options.key || null;
    this.key = options.key || null;
    this.id = options.id || null;
    this.color = options.color || 'rgba(59,130,246,0.95)';
    this.radius = options.radius !== undefined ? options.radius : 16;
    this.stroke = options.stroke || '#f8fafc';
    this.textColor = options.textColor || '#f8fafc';
    this.font = options.font || '24px sans-serif';
    this.label = options.label || '';
    this.dropAreas = options.dropAreas || [];
    this.revertOnDrop = options.revertOnDrop !== false;
    this.onDrop = options.onDrop || null;
    this.onStartDrag = options.onStartDrag || null;
    this.onEndDrag = options.onEndDrag || null;
    this.dragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.originalX = this.x;
    this.originalY = this.y;
    this.locked = !!options.locked;
  }

  _resolveBackgroundImage() {
    if (this.image) return this.image;
    if (this.imageKey && this.assets) return this.assets.getImage(this.imageKey);
    return null;
  }

  draw(ctx) {
    if (!this.visible) return;
    ctx.save();
    const img = this._resolveBackgroundImage();
    if (img) {
      ctx.drawImage(img, this.x, this.y, this.width, this.height);
    } else {
      roundRect(ctx, this.x, this.y, this.width, this.height, this.radius);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    if (this.stroke) {
      ctx.strokeStyle = this.stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    if (this.label) {
      ctx.font = this.font;
      ctx.fillStyle = this.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.label, this.x + this.width / 2, this.y + this.height / 2);
    }
    ctx.restore();
  }

  onPointerDown(x, y) {
    if (!this.visible || !this.active || this.locked) return;
    this.dragging = true;
    this.dragOffsetX = x - this.x;
    this.dragOffsetY = y - this.y;
    this.originalX = this.x;
    this.originalY = this.y;
    if (this.onStartDrag) this.onStartDrag(this);
  }

  onPointerMove(x, y) {
    if (!this.dragging || this.locked) return;
    this.x = x - this.dragOffsetX;
    this.y = y - this.dragOffsetY;
  }

  onPointerUp(x, y) {
    if (!this.dragging) return;
    this.dragging = false;
    let target = null;
    for (const area of this.dropAreas || []) {
      if (area && area.contains && area.contains(x, y)) {
        target = area;
        break;
      }
    }

    let success = false;

    if (target && target.canAccept && target.canAccept(this) !== false) {
      this.x = target.x + (target.width - this.width) / 2;
      this.y = target.y + (target.height - this.height) / 2;
      success = true;
    } else if (this.revertOnDrop) {
      this.x = this.originalX;
      this.y = this.originalY;
    }


    if (target && target.onDrop) target.onDrop(this, target, success);
    else if (this.onDrop) this.onDrop(this, null, success);
    if (this.onEndDrag) this.onEndDrag(this, target);
  }

  setImage(src, opts = {})
  {
    if (typeof src === 'string') {
      this.imageKey = src;
      this.image = null;
    } else {
      this.image = src;
      this.imageKey = null;
    }
    
    if (opts && typeof opts === 'object' && !Array.isArray(opts)) {
      const { xOrSpec, y, w, h, width, height } = opts;
      const hasPositionConfig = xOrSpec !== undefined || y !== undefined || w !== undefined || h !== undefined || width !== undefined || height !== undefined;
      if (hasPositionConfig) {
        const spec = normalizeUIPositionSpec(xOrSpec !== undefined ? xOrSpec : opts, y, w ?? width, h ?? height);
        this.x = resolveUIAnchorValue(spec.x, BASE_WIDTH, spec.width ?? this.width);
        this.y = resolveUIAnchorValue(spec.y, BASE_HEIGHT, spec.height ?? this.height);
        this.width = spec.width ?? this.width;
        this.height = spec.height ?? this.height;
      }
    }
  }

  setActive(active)
  {
    this.active = !!active;
    this.visible = !!active;

    if (!this.active) {
        this.dragging = false;
    }
  }
}

class DropArea extends UIElement {
  constructor(xOrSpec, y, w, h, opts = {}) {
    const isObjectSpec = xOrSpec && typeof xOrSpec === 'object' && !Array.isArray(xOrSpec);
    const spec = isObjectSpec ? xOrSpec : normalizeUIPositionSpec(xOrSpec, y, w, h);
    super(spec.x, spec.y, spec.width, spec.height);
    const options = isObjectSpec ? { ...spec, ...opts } : opts;

    this.assets = options.assets || null;
    this.image = options.image || options.backgroundImage || options.background || options.src || null;
    this.imageKey = options.imageKey || options.bgImageKey || options.key || null;
    this.key = options.key || options.id || null;
    this.color = options.color || 'rgba(15,23,42,0.85)';
    this.radius = options.radius !== undefined ? options.radius : 24;
    this.stroke = options.stroke || '#94a3b8';
    this.textColor = options.textColor || '#f8fafc';
    this.font = options.font || '24px sans-serif';
    this.label = options.label || '';
    this.accepts = options.accepts || null;
    this.onDrop = options.onDrop || null;
  }

  _resolveBackgroundImage() {
    if (this.image) return this.image;
    if (this.imageKey && this.assets) return this.assets.getImage(this.imageKey);
    return null;
  }

  canAccept(item) {
    if (!this.accepts) return true;
    if (typeof this.accepts === 'function') return this.accepts(item);
    if (typeof this.accepts === 'string') return item.id === this.accepts || item.key === this.accepts;
    if (Array.isArray(this.accepts)) return this.accepts.includes(item.id) || this.accepts.includes(item.key);
    return true;
  }

  draw(ctx) {
    if (!this.visible) return;
    ctx.save();
    const img = this._resolveBackgroundImage();
    if (img) {
      ctx.drawImage(img, this.x, this.y, this.width, this.height);
    } else {
      roundRect(ctx, this.x, this.y, this.width, this.height, this.radius);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    if (this.stroke) {
      ctx.strokeStyle = this.stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    if (this.label) {
      ctx.font = this.font;
      ctx.fillStyle = this.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.label, this.x + this.width / 2, this.y + this.height / 2);
    }
    ctx.restore();
  }

  setImage(imageOrKey, opts = {}) {
    if (typeof imageOrKey === 'string') {
      this.imageKey = imageOrKey;
      this.image = null;
    } else {
      this.image = imageOrKey;
      this.imageKey = null;
    }
    if (opts && typeof opts === 'object' && !Array.isArray(opts)) {
      const { xOrSpec, y, w, h, width, height } = opts;
      const hasPositionConfig = xOrSpec !== undefined || y !== undefined || w !== undefined || h !== undefined || width !== undefined || height !== undefined;
      if (hasPositionConfig) {
        const spec = normalizeUIPositionSpec(xOrSpec !== undefined ? xOrSpec : opts, y, w ?? width, h ?? height);
        this.x = resolveUIAnchorValue(spec.x, BASE_WIDTH, spec.width ?? this.width);
        this.y = resolveUIAnchorValue(spec.y, BASE_HEIGHT, spec.height ?? this.height);
        this.width = spec.width ?? this.width;
        this.height = spec.height ?? this.height;
      }
    }
  }
}
