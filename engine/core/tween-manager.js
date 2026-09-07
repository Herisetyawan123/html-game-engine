class TweenManager {
  constructor() { this.tweens = []; }
  create(target) { const tw = new Tween(target); this.tweens.push(tw); return tw; }
  update(dt) {
    this.tweens.forEach(t => t.update(dt));
    this.tweens = this.tweens.filter(t => t._active);
  }
  clear() { this.tweens = []; }
}