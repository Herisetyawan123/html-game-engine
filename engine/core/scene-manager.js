class SceneManager {
  constructor(game) { 
    this.game = game; 
    this.scenes = {
      '404': NotFoundScene,
    }; 
    this.current = null; 
    this.currentKey = null; 
  }
  register(key, SceneClass) { this.scenes[key] = SceneClass; }

  getRouteKey(defaultKey = 'home') {
    if (typeof window === 'undefined' || !window.location) return defaultKey;
    const hash = window.location.hash.replace(/^#\/?/, '').trim();
    if (!hash) return defaultKey;
    return this.scenes[hash] ? hash : defaultKey;
  }

  setHashRoute(key, options = {}) {
    if (typeof window === 'undefined' || !window.location) return;
    const normalizedKey = String(key || '').trim();
    if (!normalizedKey || ['boot', 'loading', '404'].includes(normalizedKey)) return;
    const nextHash = '#' + normalizedKey;
    if (options.replaceState) {
      history.replaceState(null, '', nextHash);
    } else if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  }

  switchTo(key, data, options = {}) {
    const normalizedKey = key || '404';
    if (this.current) this.current.destroy();
    this.game.ui.clear();
    this.game.tweens.clear();
    this.game.animations.clear();
    const SceneClass = this.scenes[normalizedKey];
    if (!SceneClass) { 
      this.current = new this.scenes['404'](this.game);
      this.currentKey = '404';
      this.current.create();
      if (options.updateRoute !== false) this.setHashRoute('404');
      return;
    }
    this.current = new SceneClass(this.game);
    this.currentKey = normalizedKey;
    this.current.create(data);

    if (!this.game.audio.muted && this.game.audio.bgm) {
      this.game.audio.startBacksound();
    }

    if (options.updateRoute !== false) this.setHashRoute(normalizedKey, options);
  }
  update(dt) { if (this.current) this.current.update(dt); }
  render(ctx) { if (this.current) this.current.render(ctx); }
}
