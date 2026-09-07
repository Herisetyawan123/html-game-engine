class AnimationManager {
  constructor() { this.animations = []; }
  register(anim) { this.animations.push(anim); return anim; }
  update(dt) { this.animations.forEach(a => a.update(dt)); }
  clear() { this.animations = []; }
}