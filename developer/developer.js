/**
 * Developer / Scene Builder - Step B Refactor
 * Canvas Preview (full) + Sidebar with Tabs (Elements/Properties/Background)
 */

class DeveloperPage {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.assets = null;
    
    this.selectedElement = null;
    this.elements = []; // Array of placed elements
    
    this.bgColor = '#1e293b';
    this.bgImage = null; // Asset key for background image
    this.showGrid = true;
    this._imageCache = {}; // key -> HTMLImageElement (cached)

    // Undo/redo history (snapshots of elements + background)
    this.history = [];
    this.historyIndex = -1;
    this._isRestoring = false;

    // Asset picker modal state
    this._assetPickerCallback = null;
    this._assetPickerCurrent = null;
    
    this.init();
  }

  /**
   * Initialize the Developer Page
   */
  init() {
    // Load assets from asset pack
    if (!window.__ASSETS_PACK__ || !window.__ASSETS_PACK__.images) {
      console.warn('Asset pack not found');
      this.assets = {};
    } else {
      this.assets = window.__ASSETS_PACK__.images;
    }
    
    // Setup canvas first
    this.setupCanvas();
    
    // Setup sidebar
    this.setupSidebar();
    
    // Setup element browser
    this.setupElementBrowser();
    
    // Setup element search
    this.setupElementSearch();

    // Setup save scene
    this.setupSaveScene();

    // Setup undo/redo, import code, asset picker
    this.setupUndoRedo();
    this.setupImportCode();
    this.setupAssetPicker();

    // Initial history snapshot
    this.pushHistory();

    console.log(`✓ Developer Page Step C initialized (Refactored Layout)`);
  }

  /**
   * Setup Canvas
   */
  setupCanvas() {
    this.canvas = document.getElementById('dev-canvas');
    if (!this.canvas) {
      console.error('Canvas element not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');

    // Direct manipulation state (drag / resize / rotate via mouse)
    this._drag = null;
    this._suppressClick = false;

    // Selection + drag start
    this.canvas.addEventListener('mousedown', (e) => this.onCanvasMouseDown(e));
    // Hover cursor feedback
    this.canvas.addEventListener('mousemove', (e) => this.onCanvasHover(e));
    // Finish drag anywhere
    window.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e));
    window.addEventListener('mouseup', (e) => this.onCanvasMouseUp(e));
    // Wheel = rotate selected (Shift = 15° step). Alt+wheel = fine 1°.
    this.canvas.addEventListener('wheel', (e) => this.onCanvasWheel(e), { passive: false });
    // Fallback click for plain selection (suppressed right after drag)
    this.canvas.addEventListener('click', (e) => {
      if (this._suppressClick) { this._suppressClick = false; return; }
      this.onCanvasClick(e);
    });

    // Draw initial canvas
    this.drawCanvas();
  }

  /** Map mouse event -> canvas coords (1280x720 space) */
  canvasPosFromEvent(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  getAnchorBase(anchor, baseSize, elementSize) {
    switch (anchor) {
      case 'center':
      case 'middle': return (baseSize - elementSize) / 2;
      case 'right':
      case 'bottom':
      case 'end': return baseSize - elementSize;
      case 'left':
      case 'top':
      case 'start':
      default: return 0;
    }
  }

  /** Inverse-rotate point into element local (unrotated) space */
  toLocalPoint(el, bounds, x, y) {
    const rad = this.getPreviewRotationRad(el);
    if (!rad) return { x, y };
    const pivot = this.getPreviewPivot(el, bounds);
    const dx = x - pivot.x;
    const dy = y - pivot.y;
    const cos = Math.cos(-rad);
    const sin = Math.sin(-rad);
    return { x: pivot.x + dx * cos - dy * sin, y: pivot.y + dx * sin + dy * cos };
  }

  /** Rotate local point back to canvas space */
  toCanvasPoint(el, bounds, x, y) {
    const rad = this.getPreviewRotationRad(el);
    if (!rad) return { x, y };
    const pivot = this.getPreviewPivot(el, bounds);
    const dx = x - pivot.x;
    const dy = y - pivot.y;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return { x: pivot.x + dx * cos - dy * sin, y: pivot.y + dx * sin + dy * cos };
  }

  /** Handle positions in canvas space (rotation-aware) */
  getHandlePositions(el, bounds) {
    const tl = this.toCanvasPoint(el, bounds, bounds.x, bounds.y);
    const tr = this.toCanvasPoint(el, bounds, bounds.x + bounds.width, bounds.y);
    const bl = this.toCanvasPoint(el, bounds, bounds.x, bounds.y + bounds.height);
    const br = this.toCanvasPoint(el, bounds, bounds.x + bounds.width, bounds.y + bounds.height);
    const top = this.toCanvasPoint(el, bounds, bounds.x + bounds.width / 2, bounds.y);
    const rot = this.toCanvasPoint(el, bounds, bounds.x + bounds.width / 2, bounds.y - 30);
    return { tl, tr, bl, br, top, rot };
  }

  /** Which part of selected element is under cursor? */
  hitTestHandles(el, x, y) {
    const bounds = this.calculateElementBounds(el);
    const h = this.getHandlePositions(el, bounds);
    const R = 12;
    const dist = (p) => Math.hypot(p.x - x, p.y - y);
    if (dist(h.rot) < R) return { mode: 'rotate', bounds };
    if (dist(h.tl) < R) return { mode: 'resize-tl', bounds };
    if (dist(h.tr) < R) return { mode: 'resize-tr', bounds };
    if (dist(h.bl) < R) return { mode: 'resize-bl', bounds };
    if (dist(h.br) < R) return { mode: 'resize-br', bounds };
    if (this.hitTestElement(el, x, y)) return { mode: 'move', bounds };
    return null;
  }

  onCanvasMouseDown(e) {
    if (e.button === 2) return;
    const { x, y } = this.canvasPosFromEvent(e);

    // 1) If something selected, handles first (resize / rotate / move)
    if (this.selectedElement) {
      const hit = this.hitTestHandles(this.selectedElement, x, y);
      if (hit) {
        const b = this.calculateElementBounds(this.selectedElement);
        this._drag = {
          el: this.selectedElement,
          mode: hit.mode,
          startX: x, startY: y,
          startElX: this.selectedElement.x,
          startElY: this.selectedElement.y,
          startW: this.selectedElement.width,
          startH: this.selectedElement.height,
          startBounds: { ...b },
          startRotate: Number(this.selectedElement.rotate ?? 0) || 0,
          moved: false,
        };
        e.preventDefault();
        return;
      }
    }

    // 2) Otherwise pick topmost element and start moving immediately (enak: klik-drag langsung jalan)
    for (let i = this.elements.length - 1; i >= 0; i--) {
      if (this.hitTestElement(this.elements[i], x, y)) {
        const el = this.elements[i];
        if (this.selectedElement !== el) this.selectElement(el);
        const b = this.calculateElementBounds(el);
        this._drag = {
          el, mode: 'move',
          startX: x, startY: y,
          startElX: el.x, startElY: el.y,
          startW: el.width, startH: el.height,
          startBounds: { ...b },
          startRotate: Number(el.rotate ?? 0) || 0,
          moved: false,
        };
        e.preventDefault();
        return;
      }
    }

    // 3) Empty space: deselect (drag state cleared on mouseup)
    this._drag = null;
  }

  onCanvasHover(e) {
    if (this._drag) return;
    if (!this.selectedElement || !this.canvas) return;
    const { x, y } = this.canvasPosFromEvent(e);
    const hit = this.hitTestHandles(this.selectedElement, x, y);
    if (!hit) { this.canvas.style.cursor = 'default'; return; }
    switch (hit.mode) {
      case 'move': this.canvas.style.cursor = 'move'; break;
      case 'rotate': this.canvas.style.cursor = 'grab'; break;
      case 'resize-tl':
      case 'resize-br': this.canvas.style.cursor = 'nwse-resize'; break;
      case 'resize-tr':
      case 'resize-bl': this.canvas.style.cursor = 'nesw-resize'; break;
      default: this.canvas.style.cursor = 'default';
    }
  }

  onCanvasMouseMove(e) {
    if (!this._drag) return;
    const rect = this.canvas ? this.canvas.getBoundingClientRect() : null;
    if (!rect) return;
    // Only track when pointer over window; map with same scale
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    // e.clientX may be outside canvas while dragging — still compute
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const d = this._drag;
    const el = d.el;
    const dx = x - d.startX;
    const dy = y - d.startY;
    if (Math.abs(dx) + Math.abs(dy) > 2) d.moved = true;

    if (d.mode === 'move') {
      let nx = d.startElX + dx;
      let ny = d.startElY + dy;
      // Snap ke grid 10px kalau Shift ditahan (presisi), default bebas
      if (e.shiftKey) { nx = Math.round(nx / 10) * 10; ny = Math.round(ny / 10) * 10; }
      el.x = Math.round(nx);
      el.y = Math.round(ny);
    } else if (d.mode === 'rotate') {
      const b = this.calculateElementBounds(el);
      const pivot = this.getPreviewPivot(el, b);
      const ang = Math.atan2(y - pivot.y, x - pivot.x) * 180 / Math.PI + 90;
      let norm = ((ang + 540) % 360) - 180; // -180..180
      if (e.shiftKey) norm = Math.round(norm / 15) * 15;
      else norm = Math.round(norm);
      el.rotate = norm;
      el.rotation = undefined; el.angle = undefined;
    } else if (d.mode && d.mode.startsWith('resize')) {
      // Work in local (unrotated) space so resize feels natural even when rotated
      const sb = d.startBounds;
      const inv = (() => {
        const rad = (Number(el.rotate ?? 0) || 0) * Math.PI / 180;
        if (!rad) return { x, y };
        const bNow = this.calculateElementBounds(el);
        const pivot = this.getPreviewPivot(el, bNow);
        const ddx = x - pivot.x, ddy = y - pivot.y;
        const cos = Math.cos(-rad), sin = Math.sin(-rad);
        return { x: pivot.x + ddx * cos - ddy * sin, y: pivot.y + ddx * sin + ddy * cos };
      })();
      let newBoundsX = sb.x, newBoundsY = sb.y;
      let newW = d.startW, newH = d.startH;
      const MIN = 10;
      if (d.mode === 'resize-br') { newW = inv.x - sb.x; newH = inv.y - sb.y; }
      if (d.mode === 'resize-bl') { newW = (sb.x + d.startW) - inv.x; newH = inv.y - sb.y; newBoundsX = inv.x; }
      if (d.mode === 'resize-tr') { newW = inv.x - sb.x; newH = (sb.y + d.startH) - inv.y; newBoundsY = inv.y; }
      if (d.mode === 'resize-tl') { newW = (sb.x + d.startW) - inv.x; newH = (sb.y + d.startH) - inv.y; newBoundsX = inv.x; newBoundsY = inv.y; }
      newW = Math.max(MIN, Math.round(newW));
      newH = Math.max(MIN, Math.round(newH));
      // Keep aspect with Shift
      if (e.shiftKey && d.startW > 0 && d.startH > 0) {
        const ratio = d.startW / d.startH;
        if (Math.abs(newW - d.startW) > Math.abs(newH - d.startH)) newH = Math.max(MIN, Math.round(newW / ratio));
        else newW = Math.max(MIN, Math.round(newH * ratio));
      }
      el.width = newW; el.height = newH;
      // Re-anchor: keep dragged edges under cursor
      const abX = this.getAnchorBase(el.anchorX, 1280, newW);
      const abY = this.getAnchorBase(el.anchorY, 720, newH);
      if (d.mode === 'resize-br') { el.x = Math.round(sb.x - abX); el.y = Math.round(sb.y - abY); }
      else if (d.mode === 'resize-bl') { el.x = Math.round(newBoundsX - abX); el.y = Math.round(sb.y - abY); }
      else if (d.mode === 'resize-tr') { el.x = Math.round(sb.x - abX); el.y = Math.round(newBoundsY - abY); }
      else { el.x = Math.round(newBoundsX - abX); el.y = Math.round(newBoundsY - abY); }
    }
    this.drawCanvas();
  }

  onCanvasMouseUp(e) {
    if (!this._drag) return;
    const wasDrag = this._drag.moved;
    const el = this._drag.el;
    this._drag = null;
    if (this.canvas) this.canvas.style.cursor = 'default';
    if (wasDrag) {
      this._suppressClick = true; // jangan toggle select right after drag
      this.drawCanvas();
      // Refresh property panel biar angka ikut tanpa perlu ketik
      if (this.selectedElement === el) this.renderPropertyEditor(el);
      this.pushHistory();
    }
  }

  onCanvasWheel(e) {
    if (!this.selectedElement) return;
    const { x, y } = this.canvasPosFromEvent(e);
    // Only when hovering selected element (biar nggak ganggu scroll page)
    if (!this.hitTestElement(this.selectedElement, x, y)) return;
    e.preventDefault();
    const step = e.shiftKey ? 15 : (e.altKey ? 1 : 5);
    const dir = e.deltaY > 0 ? 1 : -1;
    const cur = Number(this.selectedElement.rotate ?? 0) || 0;
    let next = cur + dir * step;
    next = ((next + 540) % 360) - 180;
    this.selectedElement.rotate = Math.round(next);
    this.drawCanvas();
    clearTimeout(this._wheelRenderT);
    this._wheelRenderT = setTimeout(() => {
      if (this.selectedElement) this.renderPropertyEditor(this.selectedElement);
      this.pushHistory();
    }, 300);
  }

  /**
   * Setup Sidebar Tabs
   */
  setupSidebar() {
    const tabBtns = document.querySelectorAll('.sidebar-tab-btn');
    
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Remove active from all tabs and contents
        document.querySelectorAll('.sidebar-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.sidebar-tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active to clicked tab
        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        document.getElementById(tabId).classList.add('active');
      });
    });

    // Setup background editor
    this.setupBackgroundEditor();
  }

  /**
   * Setup Background Editor
   */
  setupBackgroundEditor() {
    const bgColorInput = document.getElementById('bg-color');
    const showGridCheckbox = document.getElementById('show-grid');
    const bgImageSelect = document.getElementById('bg-image');
    const bgImagePreview = document.getElementById('bg-image-preview');
    const bgImageThumb = document.getElementById('bg-image-thumb');

    if (bgColorInput) {
      bgColorInput.addEventListener('change', (e) => {
        this.bgColor = e.target.value;
        this.drawCanvas();
        this.pushHistory();
      });
    }

    if (showGridCheckbox) {
      showGridCheckbox.addEventListener('change', (e) => {
        this.showGrid = e.target.checked;
        this.drawCanvas();
      });
    }

    // Setup background image selector (dropdown kept for compat + popup picker)
    if (bgImageSelect) {
      // Populate with asset options
      Object.keys(this.assets).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        bgImageSelect.appendChild(option);
      });

      bgImageSelect.addEventListener('change', (e) => {
        this.setBackgroundImage(e.target.value || null);
        this.pushHistory();
      });
    }

    const bgPickBtn = document.getElementById('bg-image-pick-btn');
    if (bgPickBtn) {
      bgPickBtn.addEventListener('click', () => {
        this.openAssetPicker('Background Image', this.bgImage, (key) => {
          this.setBackgroundImage(key);
          this.pushHistory();
        });
      });
    }
  }

  /**
   * Set background image + sync dropdown + thumbnail + canvas
   */
  setBackgroundImage(assetKey) {
    const bgImageSelect = document.getElementById('bg-image');
    const bgImagePreview = document.getElementById('bg-image-preview');
    const bgImageThumb = document.getElementById('bg-image-thumb');
    if (assetKey && this.assets[assetKey]) {
      this.bgImage = assetKey;
      if (bgImageSelect) bgImageSelect.value = assetKey;
      if (bgImagePreview && bgImageThumb) {
        bgImageThumb.src = this.assets[assetKey];
        bgImagePreview.style.display = 'block';
      }
    } else {
      this.bgImage = null;
      if (bgImageSelect) bgImageSelect.value = '';
      if (bgImagePreview) bgImagePreview.style.display = 'none';
    }
    this.drawCanvas();
  }

  /**
   * Get cached image for asset key (avoids flicker, sync draw when ready)
   */
  getCachedImage(assetKey) {
    if (!assetKey || !this.assets[assetKey]) return null;
    if (this._imageCache[assetKey] && this._imageCache[assetKey].complete) {
      return this._imageCache[assetKey];
    }
    const img = new Image();
    img.src = this.assets[assetKey];
    img.onload = () => this.drawCanvas();
    img.onerror = () => console.warn(`Failed to load image: ${assetKey}`);
    this._imageCache[assetKey] = img;
    return img.complete && img.naturalWidth ? img : null;
  }

  /**
   * Draw Canvas with Grid and Elements
   */
  drawCanvas() {
    if (!this.ctx) return;

    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background color
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(0, 0, w, h);

    // Background image (if set) - use cache for sync draw
    if (this.bgImage && this.assets[this.bgImage]) {
      const cached = this.getCachedImage(this.bgImage);
      if (cached) {
        this.ctx.drawImage(cached, 0, 0, w, h);
      }
    }
    this.drawGridAndElements();
  }

  /**
   * Draw Grid and Elements (called after background)
   */
  drawGridAndElements() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Grid (if enabled)
    if (this.showGrid) {
      this.ctx.strokeStyle = '#334155';
      this.ctx.lineWidth = 0.5;
      const gridSize = 100;

      for (let x = 0; x <= w; x += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, h);
        this.ctx.stroke();
      }

      for (let y = 0; y <= h; y += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(w, y);
        this.ctx.stroke();
      }
    }

    // Draw elements
    this.elements.forEach((el, idx) => {
      this.drawElement(el, idx);
    });

    // Center indicator if no elements
    if (this.elements.length === 0) {
      this.ctx.fillStyle = '#475569';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('Add elements from Element Browser', w / 2, h / 2 - 10);
      this.ctx.fillText('(Click on canvas to select)', w / 2, h / 2 + 10);
    }

    // Resolution info
    this.ctx.fillStyle = '#64748b';
    this.ctx.font = '10px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(`${w} × ${h}`, 10, 10);
  }

  /**
   * Draw Individual Element
   */
  drawElement(el, idx) {
    const isSelected = this.selectedElement === el;
    const bounds = this.calculateElementBounds(el);

    // Draw based on type
    switch (el.type) {
      case 'Label':
        this.drawLabel(bounds, el, isSelected);
        break;
      case 'Button':
        this.drawButton(bounds, el, isSelected);
        break;
      case 'ImageView':
        this.drawImageView(bounds, el, isSelected);
        break;
      case 'ImageButton':
        this.drawImageButton(bounds, el, isSelected);
        break;
      case 'ToggleImage':
        this.drawToggleImage(bounds, el, isSelected);
        break;
      case 'Panel':
        this.drawPanel(bounds, el, isSelected);
        break;
      default:
        this.drawGeneric(bounds, el, isSelected);
    }

    // Draw selection outline (follows rotation) + resize + rotate handles
    if (isSelected) {
      this.ctx.save();
      this.applyPreviewRotation(el, bounds);
      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

      // Draw resize handles (corners)
      const handleSize = 8;
      this.ctx.fillStyle = '#3b82f6';
      this.ctx.fillRect(bounds.x - handleSize/2, bounds.y - handleSize/2, handleSize, handleSize);
      this.ctx.fillRect(bounds.x + bounds.width - handleSize/2, bounds.y - handleSize/2, handleSize, handleSize);
      this.ctx.fillRect(bounds.x - handleSize/2, bounds.y + bounds.height - handleSize/2, handleSize, handleSize);
      this.ctx.fillRect(bounds.x + bounds.width - handleSize/2, bounds.y + bounds.height - handleSize/2, handleSize, handleSize);

      // Rotate handle: line from top-center up 30px + circle
      const cx = bounds.x + bounds.width / 2;
      const cy = bounds.y;
      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy);
      this.ctx.lineTo(cx, cy - 30);
      this.ctx.stroke();
      this.ctx.fillStyle = '#22c55e';
      this.ctx.beginPath();
      this.ctx.arc(cx, cy - 30, 7, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 9px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('⟳', cx, cy - 30);
      this.ctx.restore();
    }
  }

  /**
   * Calculate Element Bounds with Anchor
   */
  calculateElementBounds(el) {
    const w = 1280;
    const h = 720;

    // Calculate anchor base (support center/middle, right/bottom/end, left/top/start)
    const getAnchorBase = (anchor, baseSize, elementSize) => {
      switch (anchor) {
        case 'center':
        case 'middle': return (baseSize - elementSize) / 2;
        case 'right':
        case 'bottom':
        case 'end': return baseSize - elementSize;
        case 'left':
        case 'top':
        case 'start':
        default: return 0;
      }
    };

    const anchorBaseX = getAnchorBase(el.anchorX, w, el.width);
    const anchorBaseY = getAnchorBase(el.anchorY, h, el.height);

    return {
      x: anchorBaseX + el.x,
      y: anchorBaseY + el.y,
      width: el.width,
      height: el.height
    };
  }

  /**
   * Rotation helpers (mirror engine/ui/base-element.js)
   */
  getPreviewRotationRad(el) {
    const deg = Number(el.rotate ?? el.rotation ?? el.angle ?? el.rot) || 0;
    return deg * Math.PI / 180;
  }

  getPreviewPivot(el, bounds) {
    let px = el.pivotX ?? 0.5;
    let py = el.pivotY ?? 0.5;
    if ((el.rotateOrigin || el.origin) && (el.pivotX === undefined && el.pivotY === undefined)) {
      const p = DeveloperPage.parseRotateOrigin(el.rotateOrigin || el.origin);
      if (p) { px = p.x; py = p.y; }
    }
    return {
      x: bounds.x + bounds.width * (Number(px) || 0),
      y: bounds.y + bounds.height * (Number(py) || 0),
    };
  }

  static parseRotateOrigin(origin) {
    if (!origin || typeof origin !== 'string') return null;
    const s = origin.trim().toLowerCase();
    if (s === 'center' || s === 'middle' || s === 'centre') return { x: 0.5, y: 0.5 };
    let x = 0.5, y = 0.5;
    if (s.includes('left') || s.includes('start')) x = 0;
    if (s.includes('right') || s.includes('end')) x = 1;
    if (s.includes('top') || s.includes('up')) y = 0;
    if (s.includes('bottom') || s.includes('down')) y = 1;
    if (s === 'top' || s === 'up') x = 0.5;
    if (s === 'bottom' || s === 'down') x = 0.5;
    if (s === 'left' || s === 'start') y = 0.5;
    if (s === 'right' || s === 'end') y = 0.5;
    return { x, y };
  }

  applyPreviewRotation(el, bounds) {
    const rad = this.getPreviewRotationRad(el);
    if (!rad) return;
    const pivot = this.getPreviewPivot(el, bounds);
    this.ctx.translate(pivot.x, pivot.y);
    this.ctx.rotate(rad);
    this.ctx.translate(-pivot.x, -pivot.y);
  }

  hitTestElement(el, x, y) {
    const bounds = this.calculateElementBounds(el);
    const rad = this.getPreviewRotationRad(el);
    if (rad) {
      const pivot = this.getPreviewPivot(el, bounds);
      const dx = x - pivot.x;
      const dy = y - pivot.y;
      const cos = Math.cos(-rad);
      const sin = Math.sin(-rad);
      x = pivot.x + dx * cos - dy * sin;
      y = pivot.y + dx * sin + dy * cos;
    }
    return x >= bounds.x && x <= bounds.x + bounds.width &&
           y >= bounds.y && y <= bounds.y + bounds.height;
  }

  /**
   * Draw Label
   */
  drawLabel(bounds, el, isSelected) {
    this.ctx.save();
    this.applyPreviewRotation(el, bounds);
    this.ctx.fillStyle = '#e5e7eb';
    this.ctx.font = el.font || '24px sans-serif';
    this.ctx.textAlign = el.align || 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(el.text || 'Label', bounds.x, bounds.y);
    this.ctx.restore();
  }

  /**
   * Draw Button
   */
  drawButton(bounds, el, isSelected) {
    this.ctx.save();
    this.applyPreviewRotation(el, bounds);
    this.ctx.fillStyle = el.color || '#3b82f6';
    this.roundRect(bounds.x, bounds.y, bounds.width, bounds.height, 12);
    this.ctx.fill();
    
    this.ctx.fillStyle = el.textColor || '#ffffff';
    this.ctx.font = el.font || '24px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(el.label || 'Button', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    this.ctx.restore();
  }

  /**
   * Draw ImageView (cached, sync)
   */
  drawImageView(bounds, el, isSelected) {
    this.ctx.save();
    this.applyPreviewRotation(el, bounds);
    if (el.source && this.assets[el.source]) {
      const cached = this.getCachedImage(el.source);
      if (cached) {
        this.ctx.globalAlpha = el.opacity ?? 1;
        this.ctx.drawImage(cached, bounds.x, bounds.y, bounds.width, bounds.height);
        this.ctx.restore();
        return;
      }
      // Still loading - placeholder
      this.ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.fillStyle = '#3b82f6';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('Loading...', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      this.ctx.restore();
    } else {
      // Placeholder when no image selected
      this.ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.fillStyle = '#3b82f6';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('ImageView: pick asset', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      this.ctx.restore();
    }
  }

  /**
   * Draw ImageButton (same image logic + button border)
   */
  drawImageButton(bounds, el, isSelected) {
    this.ctx.save();
    this.applyPreviewRotation(el, bounds);
    if (el.source && this.assets[el.source]) {
      const cached = this.getCachedImage(el.source);
      if (cached) {
        this.ctx.globalAlpha = el.opacity ?? 1;
        this.ctx.drawImage(cached, bounds.x, bounds.y, bounds.width, bounds.height);
        this.ctx.restore();
        // Button affordance border (follows rotation)
        this.ctx.save();
        this.applyPreviewRotation(el, bounds);
        this.ctx.strokeStyle = isSelected ? '#3b82f6' : '#64748b';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        this.ctx.restore();
        return;
      }
      this.ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.fillStyle = '#3b82f6';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('Loading...', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      this.ctx.restore();
    } else {
      this.ctx.fillStyle = 'rgba(168, 85, 247, 0.1)';
      this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.strokeStyle = '#a855f7';
      this.ctx.setLineDash([6, 4]);
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.setLineDash([]);
      this.ctx.fillStyle = '#a855f7';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('ImageButton: pick asset', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      this.ctx.restore();
    }
  }

  /**
   * Draw ToggleImage (ON/OFF images + state badge, click canvas to toggle preview)
   */
  drawToggleImage(bounds, el, isSelected) {
    this.ctx.save();
    this.applyPreviewRotation(el, bounds);
    const activeKey = el.value ? el.keyOn : el.keyOff;
    if (activeKey && this.assets[activeKey]) {
      const cached = this.getCachedImage(activeKey);
      if (cached) {
        this.ctx.globalAlpha = el.opacity ?? 1;
        this.ctx.drawImage(cached, bounds.x, bounds.y, bounds.width, bounds.height);
        this.ctx.restore();
        // State badge
        this.ctx.save();
        this.ctx.fillStyle = el.value ? '#22c55e' : '#64748b';
        this.ctx.font = 'bold 11px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        const label = el.value ? 'ON' : 'OFF';
        const tw = this.ctx.measureText(label).width;
        this.ctx.fillStyle = el.value ? 'rgba(34,197,94,0.9)' : 'rgba(100,116,139,0.9)';
        this.ctx.fillRect(bounds.x + 4, bounds.y + 4, tw + 12, 18);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(label, bounds.x + 10, bounds.y + 7);
        this.ctx.restore();
        return;
      }
      this.ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.fillStyle = '#3b82f6';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('Loading...', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      this.ctx.restore();
    } else {
      this.ctx.fillStyle = 'rgba(34, 197, 94, 0.08)';
      this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.strokeStyle = '#22c55e';
      this.ctx.setLineDash([6, 4]);
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.ctx.setLineDash([]);
      this.ctx.fillStyle = '#22c55e';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      const missing = !el.keyOn && !el.keyOff ? 'pick ON / OFF' : el.value ? 'pick ON' : 'pick OFF';
      this.ctx.fillText(`ToggleImage: ${missing}`, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2 - 8);
      this.ctx.font = '11px sans-serif';
      this.ctx.fillStyle = '#64748b';
      this.ctx.fillText(`state: ${el.value ? 'ON' : 'OFF'} (toggle checkbox)`, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2 + 10);
      this.ctx.restore();
    }
  }

  /**
   * Draw Panel
   */
  drawPanel(bounds, el, isSelected) {
    this.ctx.save();
    this.applyPreviewRotation(el, bounds);
    this.ctx.fillStyle = el.color || 'rgba(20,20,30,0.92)';
    this.roundRect(bounds.x, bounds.y, bounds.width, bounds.height, el.radius || 16);
    this.ctx.fill();
    
    this.ctx.strokeStyle = el.stroke || '#475569';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * Draw Generic Element
   */
  drawGeneric(bounds, el, isSelected) {
    this.ctx.save();
    this.applyPreviewRotation(el, bounds);
    this.ctx.fillStyle = 'rgba(100, 116, 139, 0.2)';
    this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    this.ctx.strokeStyle = '#64748b';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    
    this.ctx.fillStyle = '#64748b';
    this.ctx.font = '12px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(el.type, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    this.ctx.restore();
  }

  /**
   * Helper: Round Rect
   */
  roundRect(x, y, w, h, r) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    this.ctx.lineTo(x + w, y + h - r);
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.ctx.lineTo(x + r, y + h);
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
  }

  /**
   * Canvas Click Handler (scale-corrected for CSS-scaled canvas)
   */
  onCanvasClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    // Canvas internal resolution is 1280x720 but CSS size may be smaller
    // (max-width:100%, object-fit:contain). Map client coords -> canvas coords.
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if clicked on element (rotation-aware)
    for (let i = this.elements.length - 1; i >= 0; i--) {
      if (this.hitTestElement(this.elements[i], x, y)) {
        this.selectElement(this.elements[i]);
        return;
      }
    }

    // Deselect
    this.selectElement(null);
  }

  /**
   * Select Element
   */
  selectElement(el) {
    this.selectedElement = el;
    const deleteBtn = document.getElementById('delete-element-btn');
    
    if (el) {
      // Switch to Properties tab
      document.querySelectorAll('.sidebar-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.sidebar-tab-content').forEach(c => c.classList.remove('active'));
      document.querySelector('[data-tab="properties-tab"]').classList.add('active');
      document.getElementById('properties-tab').classList.add('active');
      
      // Show delete button
      if (deleteBtn) {
        deleteBtn.style.display = 'block';
        deleteBtn.onclick = () => this.deleteElement(el);
      }
      
      // Render properties
      this.renderPropertyEditor(el);
    } else {
      // Reset to empty state
      document.getElementById('property-editor').innerHTML = '<div class="property-editor-empty"><p>Click an element on canvas to edit</p></div>';
      if (deleteBtn) {
        deleteBtn.style.display = 'none';
      }
    }

    this.drawCanvas();
  }

  /**
   * Delete Element
   */
  deleteElement(el) {
    const index = this.elements.indexOf(el);
    if (index > -1) {
      this.elements.splice(index, 1);
      this.selectElement(null);
      this.drawCanvas();
      this.updateElementCount();
      this.pushHistory();
      console.log(`✓ Deleted element: ${el.type}`);
    }
  }



  /**
   * Setup Element Browser - Simple List
   */
  setupElementBrowser() {
    const container = document.getElementById('element-browser');
    if (!container) return;

    // Get all elements from registry
    const allElements = Object.keys(UI_ELEMENT_REGISTRY);
    
    // Sort alphabetically
    allElements.sort();

    // Render as simple list
    allElements.forEach(elementName => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'element-item';
      itemDiv.textContent = elementName;
      itemDiv.dataset.elementType = elementName;
      itemDiv.addEventListener('click', () => this.addElement(elementName));
      container.appendChild(itemDiv);
    });
  }

  /**
   * Setup Element Search
   */
  setupElementSearch() {
    const searchInput = document.getElementById('element-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const items = document.querySelectorAll('.element-item');
      
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }

  /**
   * Add Element to Canvas
   */
  addElement(elementType) {
    const def = UI_ELEMENT_REGISTRY[elementType];
    if (!def) {
      console.warn(`Element type not found: ${elementType}`);
      return;
    }

    const newElement = {
      type: elementType,
      ...def.defaultProps
    };

    this.elements.push(newElement);
    this.selectElement(newElement);
    this.drawCanvas();
    this.updateElementCount();
    this.pushHistory();
    
    console.log(`✓ Added element: ${elementType}`);
  }

  /**
   * Render Property Editor
   */
  renderPropertyEditor(el) {
    const container = document.getElementById('property-editor');
    if (!container) return;

    const def = UI_ELEMENT_REGISTRY[el.type];
    if (!def) return;

    container.innerHTML = '';

    // Element title
    const titleDiv = document.createElement('div');
    titleDiv.className = 'property-group';
    titleDiv.style.marginBottom = '0.75rem';
    titleDiv.innerHTML = `<h3 style="color: #3b82f6; margin: 0; font-size: 0.875rem;">${el.type}</h3>`;
    container.appendChild(titleDiv);

    def.properties.forEach(prop => {
      const row = document.createElement('div');
      row.className = 'property-row';

      const label = document.createElement('label');
      label.className = 'property-label';
      label.textContent = prop.label;

      let input;

      switch (prop.type) {
        case 'number':
          input = document.createElement('input');
          input.type = 'number';
          input.className = 'property-input';
          input.value = el[prop.name] ?? 0;
          if (prop.min !== undefined) input.min = prop.min;
          if (prop.max !== undefined) input.max = prop.max;
          if (prop.step !== undefined) input.step = prop.step;
          input.addEventListener('input', (e) => {
            el[prop.name] = parseFloat(e.target.value);
            this.drawCanvas();
          });
          input.addEventListener('change', () => this.pushHistory());
          break;

        case 'text':
          input = document.createElement('input');
          input.type = 'text';
          input.className = 'property-input';
          input.value = el[prop.name] ?? '';
          if (prop.maxLength) input.maxLength = prop.maxLength;
          if (prop.placeholder) input.placeholder = prop.placeholder;
          input.addEventListener('input', (e) => {
            el[prop.name] = e.target.value;
            this.drawCanvas();
          });
          input.addEventListener('change', () => this.pushHistory());
          break;

        case 'color':
          input = document.createElement('input');
          input.type = 'color';
          input.className = 'property-input';
          input.value = el[prop.name] ?? '#ffffff';
          input.addEventListener('input', (e) => {
            el[prop.name] = e.target.value;
            this.drawCanvas();
          });
          input.addEventListener('change', () => this.pushHistory());
          break;

        case 'select':
          input = document.createElement('select');
          input.className = 'property-select';
          prop.options.forEach(optValue => {
            const option = document.createElement('option');
            option.value = optValue;
            option.textContent = optValue;
            if (el[prop.name] === optValue) option.selected = true;
            input.appendChild(option);
          });
          input.addEventListener('change', (e) => {
            el[prop.name] = e.target.value;
            if (prop.name === 'rotateOrigin' && e.target.value) {
              const p = DeveloperPage.parseRotateOrigin(e.target.value);
              if (p) { el.pivotX = p.x; el.pivotY = p.y; this.renderPropertyEditor(el); }
            }
            this.drawCanvas();
            this.pushHistory();
          });
          break;

        case 'checkbox':
          input = document.createElement('div');
          input.className = 'property-checkbox';
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = el[prop.name] ?? false;
          checkbox.addEventListener('change', (e) => {
            el[prop.name] = e.target.checked;
            this.drawCanvas();
            this.pushHistory();
          });
          const checkLabel = document.createElement('label');
          checkLabel.textContent = prop.label;
          input.appendChild(checkbox);
          input.appendChild(checkLabel);
          row.appendChild(input);
          container.appendChild(row);
          return;

        case 'asset-select': {
          const wrap = document.createElement('div');
          wrap.style.display = 'flex';
          wrap.style.flexDirection = 'column';
          wrap.style.gap = '0.4rem';

          const pickBtn = document.createElement('button');
          pickBtn.type = 'button';
          pickBtn.className = 'asset-pick-btn';

          const thumbSmall = document.createElement('img');
          const labelSpan = document.createElement('span');

          const refreshPickBtn = () => {
            const key = el[prop.name];
            if (key && this.assets[key]) {
              thumbSmall.src = this.assets[key];
              thumbSmall.style.display = 'block';
              labelSpan.textContent = key;
            } else {
              thumbSmall.removeAttribute('src');
              thumbSmall.style.display = 'none';
              labelSpan.textContent = '-- None -- klik untuk pilih gambar --';
            }
          };
          refreshPickBtn();

          pickBtn.appendChild(thumbSmall);
          pickBtn.appendChild(labelSpan);
          pickBtn.title = 'Klik untuk buka popup picker';
          pickBtn.addEventListener('click', () => {
            this.openAssetPicker(prop.label || prop.name, el[prop.name], (key) => {
              el[prop.name] = key;
              refreshPickBtn();
              refreshBigThumb();
              this.drawCanvas();
              this.pushHistory();
            });
          });

          const thumb = document.createElement('img');
          thumb.className = 'asset-preview-thumb';
          thumb.style.width = '100%';
          thumb.style.height = 'auto';
          thumb.style.maxHeight = '120px';
          thumb.style.objectFit = 'contain';
          thumb.style.borderRadius = '4px';
          thumb.style.border = '1px solid #475569';
          thumb.style.background = '#0f172a';
          const refreshBigThumb = () => {
            if (el[prop.name] && this.assets[el[prop.name]]) {
              thumb.src = this.assets[el[prop.name]];
              thumb.style.display = 'block';
            } else {
              thumb.removeAttribute('src');
              thumb.style.display = 'none';
            }
          };
          refreshBigThumb();

          wrap.appendChild(pickBtn);
          wrap.appendChild(thumb);
          input = wrap;
          break;
        }
      }

      row.appendChild(label);
      row.appendChild(input);
      container.appendChild(row);
    });
  }

  /**
   * Update element count in footer
   */
  updateElementCount() {
    const countEl = document.getElementById('element-count');
    if (countEl) countEl.textContent = this.elements.length;
  }

  // ─── Undo / Redo (Ctrl+Z) ──────────────────────────────────

  snapshotState() {
    return JSON.stringify({
      elements: this.elements,
      bgColor: this.bgColor,
      bgImage: this.bgImage,
      showGrid: this.showGrid
    });
  }

  pushHistory() {
    if (this._isRestoring) return;
    const snap = this.snapshotState();
    // Drop redo branch
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    // Avoid duplicate consecutive snapshots
    if (this.history[this.historyIndex] === snap) {
      this.updateUndoButtons();
      return;
    }
    this.history.push(snap);
    // Limit ~50
    if (this.history.length > 50) this.history.shift();
    this.historyIndex = this.history.length - 1;
    this.updateUndoButtons();
  }

  restoreSnapshot(snap) {
    this._isRestoring = true;
    try {
      const state = JSON.parse(snap);
      this.elements = state.elements || [];
      this.bgColor = state.bgColor || '#1e293b';
      this.bgImage = state.bgImage || null;
      this.showGrid = state.showGrid !== false;
      // Fix selection if element no longer exists
      if (this.selectedElement && !this.elements.includes(this.selectedElement)) {
        this.selectedElement = null;
      }
      const bgColorInput = document.getElementById('bg-color');
      if (bgColorInput) bgColorInput.value = this.bgColor;
      const showGridCheckbox = document.getElementById('show-grid');
      if (showGridCheckbox) showGridCheckbox.checked = this.showGrid;
      this.setBackgroundImage(this.bgImage);
      if (this.selectedElement) {
        this.renderPropertyEditor(this.selectedElement);
      } else {
        const pe = document.getElementById('property-editor');
        if (pe) pe.innerHTML = '<div class="property-editor-empty"><p>Click an element on canvas to edit</p></div>';
        const deleteBtn = document.getElementById('delete-element-btn');
        if (deleteBtn) deleteBtn.style.display = 'none';
      }
      this.drawCanvas();
      this.updateElementCount();
    } finally {
      this._isRestoring = false;
    }
    this.updateUndoButtons();
  }

  undo() {
    if (this.historyIndex <= 0) return;
    this.historyIndex--;
    this.restoreSnapshot(this.history[this.historyIndex]);
    console.log('↩️ Undo');
  }

  redo() {
    if (this.historyIndex >= this.history.length - 1) return;
    this.historyIndex++;
    this.restoreSnapshot(this.history[this.historyIndex]);
    console.log('↪️ Redo');
  }

  updateUndoButtons() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    if (undoBtn) undoBtn.disabled = this.historyIndex <= 0;
    if (redoBtn) redoBtn.disabled = this.historyIndex >= this.history.length - 1;
  }

  setupUndoRedo() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    if (undoBtn) undoBtn.addEventListener('click', () => this.undo());
    if (redoBtn) redoBtn.addEventListener('click', () => this.redo());
    document.addEventListener('keydown', (e) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;
      // Don't hijack typing inside inputs except allow undo globally via our history
      const tag = (e.target && e.target.tagName) || '';
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.undo();
      } else if ((key === 'y') || (key === 'z' && e.shiftKey)) {
        e.preventDefault();
        this.redo();
      } else if (typing) {
        // Let other ctrl keys pass through when typing
      }
    });
    this.updateUndoButtons();
  }

  // ─── Import Code → Preview ─────────────────────────────────

  setupImportCode() {
    const openBtn = document.getElementById('import-scene-btn');
    const modal = document.getElementById('import-modal');
    const closeBtn = document.getElementById('import-modal-close');
    const cancelBtn = document.getElementById('import-cancel-btn');
    const confirmBtn = document.getElementById('import-confirm-btn');
    const input = document.getElementById('import-code-input');
    const status = document.getElementById('import-status');
    if (!openBtn || !modal) return;
    const open = () => { modal.style.display = 'flex'; if (status) status.textContent = ''; };
    const close = () => { modal.style.display = 'none'; };
    openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (cancelBtn) cancelBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    if (confirmBtn) confirmBtn.addEventListener('click', () => {
      const code = input ? input.value : '';
      const result = this.importFromCode(code);
      if (status) {
        if (result.elements.length === 0) {
          status.textContent = '⚠️ Tidak ada element terbaca. Pastikan ada new Label/Button/ImageView/... di code.';
          status.style.color = '#fbbf24';
        } else {
          const missing = result.missingAssets.length ? ` | ⚠️ asset tidak ketemu: ${result.missingAssets.join(', ')}` : '';
          status.textContent = `✅ ${result.elements.length} element tampil di preview${result.bgImage ? ` | bg: ${result.bgImage}` : ''}${missing}`;
          status.style.color = '#22c55e';
        }
      }
      if (result.elements.length > 0) {
        // Keep modal open so user sees status, but canvas already updated
      }
    });
  }

  parseValue(raw) {
    const v = (raw || '').trim();
    if (!v) return undefined;
    // String literal
    if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"')) || (v.startsWith('`') && v.endsWith('`'))) {
      return v.slice(1, -1);
    }
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (v === 'null' || v === 'undefined') return null;
    // Number
    if (!isNaN(Number(v))) return Number(v);
    // g.assets / this.game.assets reference -> skip (marker only)
    if (/assets/.test(v)) return '__ASSETS_REF__';
    // Arrow func / function -> skip
    if (/=>|function/.test(v)) return undefined;
    // getImage('car') / assets.getImage("car") / "car"
    const mGet = v.match(/getImage\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/);
    if (mGet) return mGet[1];
    // Fallback: bare word -> return as-is string if looks like asset key
    if (/^[A-Za-z0-9_\-\/]+$/.test(v)) return v;
    return undefined;
  }

  splitTopLevelCommas(block) {
    const parts = [];
    let cur = '';
    let depthParen = 0;
    let depthBrace = 0;
    let depthBracket = 0;
    let quote = null;
    for (let i = 0; i < block.length; i++) {
      const ch = block[i];
      const prev = i > 0 ? block[i - 1] : '';
      if (quote) {
        cur += ch;
        if (ch === quote && prev !== '\\') quote = null;
        continue;
      }
      if (ch === "'" || ch === '"' || ch === '`') { quote = ch; cur += ch; continue; }
      if (ch === '(') depthParen++;
      if (ch === ')') depthParen = Math.max(0, depthParen - 1);
      if (ch === '{') depthBrace++;
      if (ch === '}') depthBrace = Math.max(0, depthBrace - 1);
      if (ch === '[') depthBracket++;
      if (ch === ']') depthBracket = Math.max(0, depthBracket - 1);
      if (ch === ',' && depthParen === 0 && depthBrace === 0 && depthBracket === 0) {
        parts.push(cur);
        cur = '';
        continue;
      }
      cur += ch;
    }
    if (cur.trim()) parts.push(cur);
    return parts;
  }

  parsePropsBlock(block) {
    const props = {};
    const parts = this.splitTopLevelCommas(block);
    parts.forEach(part => {
      const idx = part.indexOf(':');
      if (idx === -1) return;
      const key = part.slice(0, idx).trim();
      const rawVal = part.slice(idx + 1).trim();
      if (!/^\w+$/.test(key)) return;
      // Skip callbacks we can't restore
      if (/onClick|onChange|onDrop|onDrag/.test(key) && /=>|function/.test(rawVal)) return;
      if (/assets/.test(key) && /g\.assets|game\.assets|this\.game/.test(rawVal)) return;
      const parsed = this.parseValue(rawVal);
      if (parsed === undefined || parsed === '__ASSETS_REF__') return;
      props[key] = parsed;
    });
    return props;
  }

  extractNewExpressions(text) {
    // Balanced-brace scan for: new Type({ ... })
    const out = [];
    const re = /new\s+(Label|Button|ImageView|ImageButton|Panel|Popup|Dialog|Slider|Toggle|ProgressBar|Icon|ToggleImage|DragArea|DropArea)\s*\(\s*\{/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      const type = m[1];
      let idx = m.index + m[0].length - 1; // at '{'
      let depth = 0;
      let quote = null;
      let end = -1;
      for (let i = idx; i < text.length; i++) {
        const ch = text[i];
        const prev = i > 0 ? text[i - 1] : '';
        if (quote) {
          if (ch === quote && prev !== '\\') quote = null;
          continue;
        }
        if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
        if (ch === '{') depth++;
        if (ch === '}') {
          depth--;
          if (depth === 0) { end = i; break; }
        }
      }
      if (end !== -1) {
        out.push({ type, block: text.slice(idx + 1, end) });
        re.lastIndex = end + 1;
      }
    }
    return out;
  }

  mapParsedToElement(type, props) {
    const def = UI_ELEMENT_REGISTRY[type];
    if (!def) return null;
    const el = { type, ...JSON.parse(JSON.stringify(def.defaultProps)) };
    // Direct copy for known props
    Object.keys(props).forEach(k => {
      // Normalize aliases from engine code
      if (k === 'src') { el.source = props[k]; return; }
      if (k === 'imageKey') { el.source = props[k]; return; }
      if (k === 'image') { el.source = props[k]; return; }
      if (k === 'key') { el.source = props[k]; return; }
      if (k === 'rotation' || k === 'angle' || k === 'rot') { el.rotate = props[k]; return; }
      if (k === 'origin' || k === 'transformOrigin') { el.rotateOrigin = props[k]; return; }
      if (k === 'pivot' && props[k] && typeof props[k] === 'object') {
        if (props[k].x !== undefined) el.pivotX = props[k].x;
        if (props[k].y !== undefined) el.pivotY = props[k].y;
        return;
      }
      el[k] = props[k];
    });
    // Ensure numbers
    ['x','y','width','height','value','opacity','radius','rotate','pivotX','pivotY'].forEach(k => {
      if (el[k] !== undefined && el[k] !== null && typeof el[k] === 'string' && !isNaN(Number(el[k]))) {
        el[k] = Number(el[k]);
      }
    });
    // Validate asset keys exist, else keep but report missing
    return el;
  }

  importFromCode(code) {
    const text = code || '';
    const elements = [];
    const missingAssets = [];
    // 1. Background: setBackgroundImage(ctx, ..., 'key') or setBackgroundImage(ctx, assets, "key")
    let bgImage = null;
    let bgColor = null;
    const mBgImg = text.match(/setBackgroundImage\s*\([^)]*['"`]([^'"`]+)['"`]\s*\)/);
    if (mBgImg) bgImage = mBgImg[1];
    const mBgColor = text.match(/ctx\.fillStyle\s*=\s*['"`]([^'"`]+)['"`]/);
    if (mBgColor) bgColor = mBgColor[1];
    // Also support: background: 'key' / bgImage: 'key'
    if (!bgImage) {
      const mBgProp = text.match(/(?:bgImage|background|backgroundImage)\s*[:=]\s*['"`]([^'"`]+)['"`]/);
      if (mBgProp) bgImage = mBgProp[1];
    }
    // 2. Elements: new Type({ ... }) — balanced-brace scan (aman untuk rgba(), callback, nested {})
    const found = this.extractNewExpressions(text);
    found.forEach(({ type, block }) => {
      const props = this.parsePropsBlock(block);
      const el = this.mapParsedToElement(type, props);
      if (el) {
        elements.push(el);
        ['source','keyOn','keyOff'].forEach(k => {
          if (el[k] && !this.assets[el[k]] && !missingAssets.includes(el[k])) missingAssets.push(el[k]);
        });
      }
    });
    // 3. Apply to canvas
    if (elements.length > 0) {
      this.elements = elements;
      this.selectedElement = null;
      if (bgImage && this.assets[bgImage]) {
        this.bgImage = bgImage;
      } else if (bgImage && !this.assets[bgImage]) {
        // Keep bgImage name even if missing so Save still exports it, but don't break preview
        this.bgImage = bgImage;
        if (!missingAssets.includes(bgImage)) missingAssets.push(bgImage);
      }
      if (bgColor && !bgImage) this.bgColor = bgColor;
      const bgColorInput = document.getElementById('bg-color');
      if (bgColorInput && bgColor) bgColorInput.value = bgColor;
      this.setBackgroundImage(this.bgImage);
      if (bgColor && !this.bgImage) { this.bgColor = bgColor; this.drawCanvas(); }
      this.drawCanvas();
      this.updateElementCount();
      this.pushHistory();
      const pe = document.getElementById('property-editor');
      if (pe) pe.innerHTML = '<div class="property-editor-empty"><p>Click an element on canvas to edit</p></div>';
    }
    return { elements, bgImage, bgColor, missingAssets };
  }

  // ─── Asset Picker Popup (grid + folder + search) ───────────

  groupAssetsByFolder() {
    const groups = {};
    Object.keys(this.assets).sort().forEach(key => {
      const parts = key.split('/');
      const folder = parts.length > 1 ? parts[0] : 'root';
      if (!groups[folder]) groups[folder] = [];
      groups[folder].push(key);
    });
    return groups;
  }

  setupAssetPicker() {
    const modal = document.getElementById('asset-picker-modal');
    const closeBtn = document.getElementById('asset-picker-close');
    const cancelBtn = document.getElementById('asset-picker-cancel-btn');
    const clearBtn = document.getElementById('asset-picker-clear-btn');
    const search = document.getElementById('asset-picker-search');
    if (!modal) return;
    const close = () => { modal.style.display = 'none'; this._assetPickerCallback = null; };
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (cancelBtn) cancelBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    if (clearBtn) clearBtn.addEventListener('click', () => {
      if (this._assetPickerCallback) this._assetPickerCallback(null);
      close();
    });
    if (search) search.addEventListener('input', () => this.renderAssetPickerGrid(search.value));
  }

  openAssetPicker(title, currentKey, onPick) {
    const modal = document.getElementById('asset-picker-modal');
    const titleEl = document.getElementById('asset-picker-title');
    const search = document.getElementById('asset-picker-search');
    if (!modal) return;
    this._assetPickerCallback = onPick;
    this._assetPickerCurrent = currentKey || null;
    if (titleEl) titleEl.textContent = `🖼️ ${title || 'Pick Image'}`;
    if (search) search.value = '';
    this.renderAssetPickerGrid('');
    modal.style.display = 'flex';
  }

  renderAssetPickerGrid(filterText) {
    const grid = document.getElementById('asset-picker-grid');
    if (!grid) return;
    const q = (filterText || '').toLowerCase().trim();
    const groups = this.groupAssetsByFolder();
    grid.innerHTML = '';
    const folders = Object.keys(groups).sort();
    let totalShown = 0;
    folders.forEach(folder => {
      const keys = groups[folder].filter(k => !q || k.toLowerCase().includes(q) || folder.toLowerCase().includes(q));
      if (keys.length === 0) return;
      totalShown += keys.length;
      const groupDiv = document.createElement('div');
      groupDiv.className = 'asset-folder-group';
      const titleDiv = document.createElement('div');
      titleDiv.className = 'asset-folder-title';
      titleDiv.textContent = `📁 ${folder} (${keys.length})`;
      groupDiv.appendChild(titleDiv);
      const cardsDiv = document.createElement('div');
      cardsDiv.className = 'asset-grid';
      keys.forEach(key => {
        const card = document.createElement('div');
        card.className = 'asset-card' + (key === this._assetPickerCurrent ? ' selected' : '');
        const img = document.createElement('img');
        img.src = this.assets[key];
        img.alt = key;
        img.loading = 'lazy';
        const nameDiv = document.createElement('div');
        nameDiv.className = 'asset-card-name';
        // Show short name + full key on title
        const shortName = key.includes('/') ? key.split('/').pop() : key;
        nameDiv.textContent = shortName;
        nameDiv.title = key;
        card.appendChild(img);
        card.appendChild(nameDiv);
        card.title = key;
        card.addEventListener('click', () => {
          if (this._assetPickerCallback) this._assetPickerCallback(key);
          const modal = document.getElementById('asset-picker-modal');
          if (modal) modal.style.display = 'none';
          this._assetPickerCallback = null;
        });
        cardsDiv.appendChild(card);
      });
      groupDiv.appendChild(cardsDiv);
      grid.appendChild(groupDiv);
    });
    if (totalShown === 0) {
      grid.innerHTML = '<div style="color:#64748b; font-size:0.8rem; text-align:center; padding:1rem;">No images found. Coba kata kunci lain.</div>';
    }
  }

  // ─── Save Scene ────────────────────────────────────────────

  /**
   * Setup Save Scene button and modal
   */
  setupSaveScene() {
    const saveBtn = document.getElementById('save-scene-btn');
    const modal = document.getElementById('save-modal');
    const closeBtn = document.getElementById('save-modal-close');
    const nameInput = document.getElementById('scene-name-input');
    const codeOutput = document.getElementById('scene-code-output');
    const copyBtn = document.getElementById('copy-scene-btn');
    const downloadBtn = document.getElementById('download-scene-btn');

    if (!saveBtn || !modal) return;

    // Open modal
    saveBtn.addEventListener('click', () => {
      const name = nameInput.value.trim() || 'MyScene';
      nameInput.value = name;
      codeOutput.value = this.generateSceneCode(name);
      modal.style.display = 'flex';
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });

    // Regenerate code when name changes
    nameInput.addEventListener('input', (e) => {
      const name = e.target.value.trim() || 'MyScene';
      codeOutput.value = this.generateSceneCode(name);
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(codeOutput.value).then(() => {
        copyBtn.textContent = '✅ Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = '📋 Copy Code';
          copyBtn.classList.remove('copied');
        }, 2000);
      });
    });

    // Download as .js file
    downloadBtn.addEventListener('click', () => {
      const name = nameInput.value.trim() || 'MyScene';
      const filename = this.toKebabCase(name) + '-scene.js';
      const blob = new Blob([codeOutput.value], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  /**
   * Generate Scene Code from current elements
   */
  generateSceneCode(sceneName) {
    let className = this.toPascalCase(sceneName);
    // Avoid double suffix: "MyScene" -> "MySceneScene"
    if (/Scene$/i.test(className)) className = className.replace(/Scene$/i, '');
    if (!className) className = 'My';
    className = className + 'Scene';
    const lines = [];

    lines.push(`class ${className} extends Scene {`);
    lines.push(`  create() {`);
    lines.push(`    const g = this.game;`);

    // Generate code for each element
    this.elements.forEach((el, idx) => {
      lines.push('');
      lines.push(`    // ${el.type} ${idx + 1}`);
      const code = this.generateElementCode(el, idx);
      lines.push(code);
    });

    lines.push(`  }`);
    lines.push('');

    // Render method
    lines.push(`  render(ctx) {`);
    if (this.bgImage) {
      lines.push(`    setBackgroundImage(ctx, this.game.assets, '${this.bgImage}');`);
    } else {
      lines.push(`    ctx.fillStyle = '${this.bgColor}';`);
      lines.push(`    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);`);
    }
    lines.push(`  }`);
    lines.push(`}`);

    return lines.join('\n');
  }

  /**
   * Generate code for a single element
   */
  generateElementCode(el, idx = 0) {
    const def = UI_ELEMENT_REGISTRY[el.type];
    if (!def) return `    // Unknown element type: ${el.type}`;

    // Build props object - only include non-default values
    const props = {};
    const defaults = def.defaultProps;

    // Always include position and anchor
    props.x = el.x ?? 0;
    props.y = el.y ?? 0;
    props.anchorX = el.anchorX || 'left';
    props.anchorY = el.anchorY || 'top';

    // Include size
    if (el.width !== undefined) props.width = el.width;
    if (el.height !== undefined) props.height = el.height;

    // Include rotation (only when non-default to keep code clean)
    const rot = Number(el.rotate ?? el.rotation ?? el.angle ?? 0) || 0;
    if (rot) props.rotate = rot;
    const pvx = el.pivotX !== undefined ? Number(el.pivotX) : 0.5;
    const pvy = el.pivotY !== undefined ? Number(el.pivotY) : 0.5;
    if (rot && (pvx !== 0.5 || pvy !== 0.5)) { props.pivotX = pvx; props.pivotY = pvy; }
    if (rot && el.rotateOrigin) props.rotateOrigin = el.rotateOrigin;

    // Type-specific properties
    switch (el.type) {
      case 'Label':
        if (el.text) props.text = el.text;
        if (el.font && el.font !== '24px sans-serif') props.font = el.font;
        if (el.color && el.color !== '#e5e7eb') props.color = el.color;
        if (el.align && el.align !== 'left') props.align = el.align;
        break;

      case 'Button':
        if (el.label) props.label = el.label;
        if (el.color && el.color !== '#3b82f6') props.color = el.color;
        if (el.hoverColor && el.hoverColor !== '#2563eb') props.hoverColor = el.hoverColor;
        if (el.textColor && el.textColor !== '#ffffff') props.textColor = el.textColor;
        if (el.font && el.font !== '24px sans-serif') props.font = el.font;
        // onClick placeholder
        props.onClick = '__FUNC__() => { /* TODO */ }';
        break;

      case 'ImageView':
        if (el.source) {
          props.src = el.source;
          props.assets = '__REF__g.assets';
        }
        if (el.opacity !== undefined && el.opacity !== 1) props.opacity = el.opacity;
        break;

      case 'ImageButton':
        if (el.source) {
          props.src = el.source;
          props.assets = '__REF__g.assets';
        }
        if (el.opacity !== undefined && el.opacity !== 1) props.opacity = el.opacity;
        props.onClick = '__FUNC__() => { /* TODO */ }';
        break;

      case 'Panel':
        if (el.color) props.color = el.color;
        if (el.radius !== undefined) props.radius = el.radius;
        if (el.stroke) props.stroke = el.stroke;
        break;

      case 'ToggleImage':
        if (el.keyOn) props.keyOn = el.keyOn;
        if (el.keyOff) props.keyOff = el.keyOff;
        if (el.value !== undefined) props.value = el.value;
        props.assets = '__REF__g.assets';
        props.onChange = '__FUNC__(v) => { /* TODO */ }';
        if (el.opacity !== undefined && el.opacity !== 1) props.opacity = el.opacity;
        break;

      case 'Slider':
        if (el.value !== undefined) props.value = el.value;
        props.onChange = '__FUNC__(v) => { /* TODO */ }';
        break;

      case 'Toggle':
        if (el.value !== undefined) props.value = el.value;
        props.onChange = '__FUNC__(v) => { /* TODO */ }';
        break;

      case 'ProgressBar':
        if (el.value !== undefined) props.value = el.value;
        break;

      case 'Icon':
        // Engine Icon only supports drawFn — emit placeholder so output runs
        props.drawFn = '__FUNC__(ctx, x, y, w, h) => { ctx.fillStyle = "#64748b"; ctx.fillRect(x, y, w, h); }';
        break;

      case 'Popup':
      case 'Dialog': {
        if (el.color) props.color = el.color;
        if (el.radius !== undefined) props.radius = el.radius;
        if (el.stroke) props.stroke = el.stroke;
        // Engine Popup has no title prop — emit title as a child Label.
        // Popup children must be wired via g.ui.addPopup so input works.
        const propsStr2 = this.formatPropsCode(props);
        const varName = `popup${idx + 1}`;
        const title = (el.title || '').replace(/'/g, "\\'");
        const titleBlock = title
          ? `\n    ${varName}.add(\n      new Label({\n        x: ${el.x ?? 0},\n        y: ${(el.y ?? 0) + 24},\n        anchorX: '${el.anchorX || 'left'}',\n        anchorY: '${el.anchorY || 'top'}',\n        width: ${el.width ?? 400},\n        text: '${title}',\n        align: 'center',\n        font: 'bold 24px sans-serif'\n      })\n    );`
          : '';
        return `    const ${varName} = new ${el.type}(${propsStr2});${titleBlock}\n    g.ui.addPopup(${varName});`;
      }

      case 'DragArea':
        if (el.color) props.color = el.color;
        if (el.radius !== undefined) props.radius = el.radius;
        if (el.stroke) props.stroke = el.stroke;
        if (el.label) props.label = el.label;
        if (el.textColor) props.textColor = el.textColor;
        if (el.font) props.font = el.font;
        if (el.source) {
          props.imageKey = el.source;
          props.assets = '__REF__g.assets';
        }
        if (el.id) props.id = el.id;
        if (el.key) props.key = el.key;
        props.dropAreas = '__REF__[]';
        props.onDrop = '__FUNC__(item, target, success) => { /* TODO */ }';
        break;

      case 'DropArea':
        if (el.color) props.color = el.color;
        if (el.radius !== undefined) props.radius = el.radius;
        if (el.stroke) props.stroke = el.stroke;
        if (el.label) props.label = el.label;
        if (el.textColor) props.textColor = el.textColor;
        if (el.font) props.font = el.font;
        if (el.source) {
          props.imageKey = el.source;
          props.assets = '__REF__g.assets';
        }
        if (el.id) props.id = el.id;
        if (el.key) props.key = el.key;
        props.onDrop = '__FUNC__(item, target, success) => { /* TODO */ }';
        break;
    }

    // Format the props object as code
    const propsStr = this.formatPropsCode(props);

    return `    g.ui.add(\n      new ${el.type}(${propsStr})\n    );`;
  }

  /**
   * Format props object as readable code string
   */
  formatPropsCode(props) {
    const entries = Object.entries(props);
    if (entries.length === 0) return '{}';

    const lines = entries.map(([key, value]) => {
      if (typeof value === 'string' && value.startsWith('__FUNC__')) {
        // Function value - no quotes
        return `      ${key}: ${value.replace('__FUNC__', '')}`;
      }
      if (typeof value === 'string' && value.startsWith('__REF__')) {
        // Reference value - no quotes
        return `      ${key}: ${value.replace('__REF__', '')}`;
      }
      if (typeof value === 'string') {
        return `      ${key}: '${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
      }
      if (typeof value === 'boolean') {
        return `      ${key}: ${value}`;
      }
      if (typeof value === 'number') {
        return `      ${key}: ${value}`;
      }
      return `      ${key}: ${JSON.stringify(value)}`;
    });

    return `{\n${lines.join(',\n')}\n    }`;
  }

  /**
   * Convert string to PascalCase
   */
  toPascalCase(str) {
    return str
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');
  }

  /**
   * Convert string to kebab-case
   */
  toKebabCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .toLowerCase()
      .replace(/^-|-$/g, '');
  }

}


// Initialize Developer Page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.devPage = new DeveloperPage();
});
