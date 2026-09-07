/* ================================ TweenManager ================================= */
const Easing = {
  linear: t => t,
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeOutBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
};

class Tween {
  constructor(target) {
    this.target = target;
    this.chain = [];       // steps: {type:'to'|'delay'|'call', ...}
    this._loop = false;
    this._index = 0;
    this._elapsed = 0;
    this._from = null;
    this._active = false;
    this._onComplete = null;
  }
  to(props, duration = 0.3, easing = Easing.linear) { this.chain.push({ type: 'to', props, duration, easing }); return this; }
  delay(duration) { this.chain.push({ type: 'delay', duration }); return this; }
  call(fn) { this.chain.push({ type: 'call', fn }); return this; }
  loop(v = true) { this._loop = v; return this; }
  onComplete(fn) { this._onComplete = fn; return this; }
  start() { this._active = true; this._index = 0; this._elapsed = 0; this._from = null; return this; }
  stop() { this._active = false; }
  update(dt) {
    if (!this._active || this.chain.length === 0) return;
    const step = this.chain[this._index];
    if (step.type === 'call') { step.fn && step.fn(); this._advance(); return; }
    if (step.type === 'delay') {
      this._elapsed += dt;
      if (this._elapsed >= step.duration) { this._elapsed = 0; this._advance(); }
      return;
    }
    if (step.type === 'to') {
      if (this._from === null) {
        this._from = {};
        for (const k in step.props) this._from[k] = this.target[k];
      }
      this._elapsed += dt;
      const t = Math.min(1, this._elapsed / step.duration);
      const et = step.easing(t);
      for (const k in step.props) this.target[k] = this._from[k] + (step.props[k] - this._from[k]) * et;
      if (t >= 1) { this._elapsed = 0; this._from = null; this._advance(); }
    }
  }
  _advance() {
    this._index++;
    if (this._index >= this.chain.length) {
      if (this._loop) this._index = 0;
      else { this._active = false; this._onComplete && this._onComplete(); }
    }
  }
}