/* ============================ Container Element ============================ */
/* Parent element that groups other UI elements.
   - Children coordinates (x, y + anchorX/anchorY) are RELATIVE to the
     container content box, NOT to the canvas.
   - Container itself is positioned on the canvas like any other element
     (x, y + anchorX/anchorY + rotate/pivot).
   - Background can be a solid color, an image asset, or both (image on top
     of color). Update at runtime via setBackgroundColor / setBackgroundImage.
   Usage:
     const c = g.ui.add(new Container({ x: 100, y: 100, width: 400, height: 300, color: '#0f172a', radius: 16 }));
     c.add(new Label({ x: 20, y: 20, text: 'Hi' }));
     c.add(new Button({ x: 20, y: 80, width: 160, height: 50, label: 'OK', onClick }));
     c.setBackgroundImage('panel_bg', g.assets);
*/
class Container extends UIElement {
  constructor(opts = {}) {
    const spec = normalizeUIPositionSpec(opts);
    super(spec);
    const options = opts;
    this.isContainer = true;
    this.children = [];
    this.color = options.color ?? options.backgroundColor ?? options.bg ?? null;
    this.src = options.src ?? options.image ?? options.imageSrc ?? options.backgroundImage ?? null;
    this.assets = options.assets ?? null;
    this.radius = options.radius !== undefined ? options.radius : 16;
    this.stroke = options.stroke ?? null;
    this.opacity = options.opacity !== undefined ? options.opacity : 1;
    this.clip = options.clip !== undefined ? !!options.clip : true;
    this.onClick = options.onClick ?? options.onclick ?? null;
    this._activeChild = null;
    this._errorMessage = null;
    // Adopt initial children passed via opts.children (array of UIElement).
    if (Array.isArray(options.children)) {
      options.children.forEach((c) => this.add(c));
    }
  }

  /* ---------------- children management ---------------- */
  add(el) {
    if (!el) return el;
    this.children.push(el);
    el._parent = this;
    return el;
  }
  remove(el) {
    if (typeof el === 'string') {
      const key = el;
      el = this.children.find((c) => c.key === key);
      if (!el) {
        // Search recursively inside nested containers.
        for (const c of this.children) {
          if (c && c.isContainer) {
            const found = c.getByKey ? c.getByKey(key) : null;
            if (found) { c.remove(found); return found; }
          }
        }
        return null;
      }
    }
    const i = this.children.indexOf(el);
    if (i >= 0) this.children.splice(i, 1);
    if (el) el._parent = null;
    if (this._activeChild === el) this._activeChild = null;
    return el;
  }
  clear() {
    this.children.forEach((c) => { c._parent = null; });
    this.children = [];
    this._activeChild = null;
  }
  getByKey(key) {
    for (const c of this.children) {
      if (c.key === key) return c;
      if (c.isContainer && c.getByKey) {
        const found = c.getByKey(key);
        if (found) return found;
      }
    }
    return null;
  }

  /* ---------------- background ---------------- */
  setBackgroundColor(color) { this.color = color; return this; }
  setBackgroundImage(src, assets) {
    this.src = src;
    if (assets) this.assets = assets;
    return this;
  }
  /** Accepts either an asset key / image object or a CSS color string. */
  setBackground(bg, assets) {
    if (assets) this.assets = assets;
    if (typeof bg === 'string' && this.assets && this.assets.getImage && this.assets.getImage(bg)) {
      this.src = bg;
    } else if (typeof bg === 'string' && /^(#|rgb|rgba|hsl|transparent)/i.test(bg.trim())) {
      this.color = bg;
    } else if (typeof bg === 'string') {
      // Assume asset key (may resolve later once assets are ready).
      this.src = bg;
    } else if (bg) {
      this.src = bg;
    }
    return this;
  }
  _isValidImage(img) {
    if (!img) return false;
    const validTypes = [HTMLImageElement, HTMLCanvasElement, HTMLVideoElement, ImageBitmap, OffscreenCanvas];
    if (typeof SVGImageElement !== 'undefined') validTypes.push(SVGImageElement);
    if (typeof VideoFrame !== 'undefined') validTypes.push(VideoFrame);
    return validTypes.some((t) => img instanceof t);
  }
  _resolveImage() {
    if (!this.src) return null;
    if (typeof this.src === 'string' && this.assets) {
      const img = this.assets.getImage(this.src);
      if (!this._isValidImage(img)) {
        this._errorMessage = `Failed: "${this.src}"`;
        return null;
      }
      this._errorMessage = null;
      return img;
    }
    if (this._isValidImage(this.src)) {
      this._errorMessage = null;
      return this.src;
    } else if (this.assets && typeof this.src === 'string') {
      const img = this.assets.getImage(this.src);
      if (!this._isValidImage(img)) {
        this._errorMessage = `Failed: "${this.src}"`;
        return null;
      }
      return img;
    }
    return null;
  }

  /* ---------------- coordinate helpers ---------------- */
  /** World bounds of a direct child: container origin + anchor-inside-container + offset. */
  getChildWorldBounds(child) {
    const bounds = this.getWorldPosition();
    const abX = calculateAnchorBase(child.anchorX, this.width, child.width);
    const abY = calculateAnchorBase(child.anchorY, this.height, child.height);
    return {
      x: bounds.x + abX + (Number(child.x) || 0),
      y: bounds.y + abY + (Number(child.y) || 0),
      width: child.width,
      height: child.height,
    };
  }
  /** Inverse-rotate a canvas point into this container's unrotated space. */
  _toLocalPoint(px, py) {
    const rad = this.getRotationRadians();
    if (!rad) return { x: px, y: py };
    const pivot = this.getRotationPivot(this.getWorldPosition());
    const dx = px - pivot.x;
    const dy = py - pivot.y;
    const cos = Math.cos(-rad);
    const sin = Math.sin(-rad);
    return { x: pivot.x + dx * cos - dy * sin, y: pivot.y + dx * sin + dy * cos };
  }
  _hitChild(x, y) {
    const local = this._toLocalPoint(x, y);
    for (let i = this.children.length - 1; i >= 0; i--) {
      const c = this.children[i];
      if (c && c.contains && c.contains(local.x, local.y)) return c;
    }
    return null;
  }

  contains(px, py) {
    if (!this.visible || !this.active) return false;
    const local = this._toLocalPoint(px, py);
    // Any child hit counts as container hit (even outside bounds when clip=false).
    for (let i = this.children.length - 1; i >= 0; i--) {
      const c = this.children[i];
      if (c && c.contains && c.contains(local.x, local.y)) return true;
    }
    const bounds = this.getWorldPosition();
    return local.x >= bounds.x && local.x <= bounds.x + bounds.width &&
           local.y >= bounds.y && local.y <= bounds.y + bounds.height;
  }

  onPointerDown(x, y) {
    if (!this.visible || !this.active) return;
    const hit = this._hitChild(x, y);
    this._activeChild = hit;
    if (hit && hit.onPointerDown) {
      const local = this._toLocalPoint(x, y);
      hit.onPointerDown(local.x, local.y);
    }
  }
  onPointerMove(x, y, hit) {
    if (!this.visible || !this.active) return;
    const local = this._toLocalPoint(x, y);
    // Route drag to the pressed child even when pointer leaves it.
    const target = this._activeChild || this._hitChild(x, y);
    if (target && target.onPointerMove) {
      // Per-child hit flag for hover states.
      const childHit = target.contains ? target.contains(local.x, local.y) : hit;
      target.onPointerMove(local.x, local.y, childHit);
    }
  }
  onPointerUp(x, y, hit) {
    const local = this._toLocalPoint(x, y);
    const target = this._activeChild || this._hitChild(x, y);
    if (target && target.onPointerUp) {
      const childHit = target.contains ? target.contains(local.x, local.y) : hit;
      target.onPointerUp(local.x, local.y, childHit);
    }
    // Container's own click when no child consumed the press.
    if (!target && this.onClick) {
      const bounds = this.getWorldPosition();
      const inside = local.x >= bounds.x && local.x <= bounds.x + bounds.width &&
                     local.y >= bounds.y && local.y <= bounds.y + bounds.height;
      if (inside && hit) this.onClick(this);
    }
    this._activeChild = null;
  }

  draw(ctx) {
    if (!this.visible) return;
    const bounds = this.getWorldPosition();
    ctx.save();
    this.applyRotation(ctx, bounds);
    // Clip children to the container box (rounded when radius > 0).
    if (this.clip) {
      roundRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, this.radius || 0);
      ctx.clip();
    }
    // Background color.
    if (this.color) {
      roundRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, this.radius || 0);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    // Background image on top of color.
    const img = this._resolveImage();
    if (img) {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      if (!this.clip && (this.radius || 0) > 0) {
        roundRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, this.radius);
        ctx.clip();
      }
      ctx.drawImage(img, bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.restore();
    }
    // Border stroke.
    if (this.stroke) {
      roundRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, this.radius || 0);
      ctx.strokeStyle = this.stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    // Children draw in container space (they resolve world pos via _parent).
    // Their own save/applyRotation stacks on top of the container transform.
    for (const c of this.children) {
      if (c && c.draw) c.draw(ctx);
    }
    ctx.restore();
  }
}
