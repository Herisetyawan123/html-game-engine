/* ============================ StorageManager ============================ */
/* Wraps localStorage. No network requests. Namespaced so multiple games
   built on this framework don't collide with each other's saves. */
class StorageManager {
  constructor(namespace = 'hgf') { this.ns = namespace; }
  _key(k) { return `${this.ns}_${k}`; }
  get(key, def = null) {
    try {
      const raw = localStorage.getItem(this._key(key));
      return raw === null ? def : JSON.parse(raw);
    } catch (e) { return def; }
  }
  set(key, value) {
    try { localStorage.setItem(this._key(key), JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }
  remove(key) { try { localStorage.removeItem(this._key(key)); } catch (e) {} }

  getHighScore() { return this.get('highScore', 0); }
  setHighScore(v) { if (v > this.getHighScore()) this.set('highScore', v); }

  getSettings() { return this.get('settings', { muted: false, volume: 1 }); }
  setSettings(s) { this.set('settings', s); }

  getProgress() { return this.get('progress', { level: 1 }); }
  setProgress(p) { this.set('progress', p); }

  getUnlockedLevels() { return this.get('unlockedLevels', [1]); }
  unlockLevel(n) {
    const arr = this.getUnlockedLevels();
    if (!arr.includes(n)) { arr.push(n); this.set('unlockedLevels', arr); }
  }
}
