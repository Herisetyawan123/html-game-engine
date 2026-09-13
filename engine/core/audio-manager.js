/* ============================= AudioManager =============================== */
/* Uses the WebAudio API to synthesize SFX/BGM procedurally, so there are no
   audio files to embed or fetch. Mute/volume are persisted via StorageManager. */
class AudioManager {
  constructor(storage) {
    this.storage = storage;
    const s = storage.getSettings();
    this.muted = !!s.muted;
    this.volume = s.volume !== undefined ? s.volume : 0.3;
    this.ctx = null;
    this.bgmOsc = null;
    this.bgmGain = null;
    this.bgmPlaying = false;
    this.bgm = null;
    this.bgmAudio = null;
  }
  _ensureCtx() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return true;
  }
  playSfx(freq = 440, duration = 0.12, type = 'sine') {
    if (this.muted) return;
    if (!this._ensureCtx()) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.value = this.volume * 0.3;
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + duration);
  }
  playClick() { this.playSfx(600, 0.08, 'square'); }
  playSuccess() {
    this.playSfx(880, 0.15, 'sine');
    setTimeout(() => this.playSfx(1200, 0.15, 'sine'), 100);
  }
  playError() { this.playSfx(170, 0.22, 'sawtooth'); }

  startBgm(freq = 220) {
    if (this.muted || this.bgmPlaying) return;
    if (!this._ensureCtx()) return;
    const ctx = this.ctx;
    this.bgmOsc = ctx.createOscillator();
    this.bgmGain = ctx.createGain();
    this.bgmOsc.type = 'sine'; this.bgmOsc.frequency.value = freq;
    this.bgmGain.gain.value = this.volume * 0.05;
    this.bgmOsc.connect(this.bgmGain); this.bgmGain.connect(ctx.destination);
    this.bgmOsc.start();
    this.bgmPlaying = true;
  }
  stopBgm() {
    if (this.bgmOsc) { try { this.bgmOsc.stop(); } catch (e) {} this.bgmOsc = null; }
    this.bgmPlaying = false;
  }
  setMuted(m) {
    this.muted = !!m;
    this._saveSettings();

    if (this.muted) {
      this.pauseBacksound();
      this.stopBgm();
      return;
    }

    if (this.bgm) this.startBacksound();
  }
  toggleMute() { this.setMuted(!this.muted); return this.muted; }
  setVolume(v) {
    this.volume = clamp(v, 0, 1);
    if (this.bgmGain) this.bgmGain.gain.value = this.volume * 0.05;
    this._saveSettings();
  }
  _saveSettings() { this.storage.setSettings({ muted: this.muted, volume: this.volume }); }
  
  startBacksound(opt = {})
  {
      const bgm = this.bgm;
      this.muted = false;
      if (!bgm) return;
      this.muted = false;
      // Belum pernah dibuat
      if (!this.bgmAudio) {
          this.bgmAudio = new Audio();
          this.bgmAudio.src = bgm;
          this.bgmAudio.loop = true;
          this.bgmAudio.volume = this.volume;
      }

      // Sinkronkan volume
      this.bgmAudio.volume = this.volume;
      // Resume jika sedang pause
      if (this.bgmAudio.paused && !this.muted) {
          this.bgmAudio.play().catch(() => {});
      }
  }
  pauseBacksound()
  {
      this.muted = true;
      if (this.bgmAudio && !this.bgmAudio.paused) {
          this.bgmAudio.pause();
      }
  }
  destroyBacksound()
  {
      if (!this.bgmAudio) return;

      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
      this.bgmAudio.src = "";
      this.bgmAudio.load();

      this.bgmAudio = null;
  }
  play(src, opt = {}) {
      const audio = new Audio();
      audio.src = src;
      audio.play().catch(() => {});
  } 

  getAudioDuration(src) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      audio.src = src;

      audio.addEventListener("loadedmetadata", () => {
        resolve(audio.duration);
      });

      audio.addEventListener("error", reject);
    });
  }
}