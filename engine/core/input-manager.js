/* ================================ InputManager ================================ */
/* Unifies mouse, touch and pointer input into a single pointer-event pipeline.
   UI elements (or any object exposing x/y/width/height + contains()) register
   themselves here and receive onPointerDown/Move/Up callbacks. */
class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.targets = [];
    this.pointerX = 0; this.pointerY = 0; this.isDown = false;
    const opts = { passive: false };
    canvas.addEventListener('pointerdown', e => this._handle(e, 'down'), opts);
    canvas.addEventListener('pointerup', e => this._handle(e, 'up'), opts);
    canvas.addEventListener('pointermove', e => this._handle(e, 'move'), opts);
    canvas.addEventListener('pointercancel', e => this._handle(e, 'up'), opts);
  }
  _toCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }
  _handle(e, type) {
    e.preventDefault();
    const { x, y } = this._toCanvasCoords(e);
    this.pointerX = x; this.pointerY = y;
    if (type === 'down') this.isDown = true;
    if (type === 'up') this.isDown = false;
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      if (!t || t.active === false) continue;
      const hit = t.contains ? t.contains(x, y) : false;
      if (type === 'down' && hit && t.onPointerDown) { t.onPointerDown(x, y); break; }
      if (type === 'up' && t.onPointerUp) t.onPointerUp(x, y, hit);
      if (type === 'move' && t.onPointerMove) t.onPointerMove(x, y, hit);
    }
  }
  register(target) { if (this.targets.indexOf(target) === -1) this.targets.push(target); }
  unregister(target) {
    const i = this.targets.indexOf(target);
    if (i >= 0) this.targets.splice(i, 1);
  }
}