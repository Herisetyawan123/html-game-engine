
/* ==========================================================================
   OFFLINE HTML5 MINI GAME FRAMEWORK
   --------------------------------------------------------------------------
   A single-file, dependency-free, file://-compatible mini game engine.

   - No network requests, no build step, no external libraries.
   - Everything (assets, audio, UI) is generated/declared in-code.
   - Organized into independent, reusable manager classes (see below).
   - A small demo "card matching" game is included to prove the framework
     end-to-end and to serve as a template for future games.

   MANAGERS:
     StorageManager     - localStorage wrapper (settings, high score, progress)
     AssetManager        - registers procedurally-drawn / base64 assets, no HTTP
     AudioManager         - WebAudio based SFX/BGM, mute/volume, persisted
     InputManager         - unified mouse / touch / pointer handling
     ResponsiveManager     - canvas scaling + letterboxing, keeps aspect ratio
     RotateManager          - mobile portrait lock overlay
     FullscreenManager        - one-time fullscreen request on rotate to landscape
     TweenManager               - move / scale / rotate / fade / sequence / loop
     AnimationManager             - sprite-sheet frame animation
     UIManager                     - reusable UI components (Button, Slider, ...)
     SceneManager                   - registers & switches between Scene objects
     Game                            - owns the loop and wires everything together
   ========================================================================== */


/* ============================== AnimationManager ================================ */
/* Lightweight sprite-sheet frame animator, independent of the tween system. */
class SpriteAnimation {
  constructor(spriteSheet, fps = 10, loop = true) {
    this.sheet = spriteSheet; this.fps = fps; this.loop = loop;
    this.frame = 0; this.timer = 0; this.playing = true;
  }
  update(dt) {
    if (!this.playing) return;
    this.timer += dt;
    const frameDuration = 1 / this.fps;
    if (this.timer >= frameDuration) {
      this.timer -= frameDuration;
      this.frame++;
      if (this.frame >= this.sheet.frameCount) {
        if (this.loop) this.frame = 0;
        else { this.frame = this.sheet.frameCount - 1; this.playing = false; }
      }
    }
  }
  draw(ctx, x, y, w, h) {
    const sx = this.frame * this.sheet.frameW;
    ctx.drawImage(this.sheet.canvas, sx, 0, this.sheet.frameW, this.sheet.frameH,
                  x, y, w || this.sheet.frameW, h || this.sheet.frameH);
  }
}



/* ==================================== Game (root) ==================================== */
class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container = document.getElementById('game-container');
    this.overlay = document.getElementById('rotate-overlay');
    this.overlay_fs = document.getElementById('fullscreen-overlay')
    this.btn_fs = document.getElementById('btn-fullscreen');

    this.storage = new StorageManager('hgf_demo');
    this.assets = new AssetManager();
    this.responsive = new ResponsiveManager(this.canvas, this.container, BASE_WIDTH, BASE_HEIGHT);
    this.input = new InputManager(this.canvas);
    this.audio = new AudioManager(this.storage);
    this.tweens = new TweenManager();
    this.animations = new AnimationManager();
    this.ui = new UIManager(this.input);
    this.scenes = new SceneManager(this);
    this.fullscreen = new FullscreenManager(this.overlay_fs, this.btn_fs);
    this.rotate = new RotateManager(
      this.overlay, this.fullscreen,
      () => { this.paused = false; },   // onLandscape
      () => { this.paused = true; }     // onPortrait
    );
    this.fullscreen.eventAfterFullscreen(
      () => {
        this.audio.startBacksound();
      },
      () => {
        this.audio.destroyBacksound();
      }
    );

    this.paused = false;
    this.lastTime = 0;
    this.fixedStep = 1 / 60;
    this.accumulator = 0;

    registerAllAssets(this.assets, window.__ASSETS_PACK__);

    this.audio.bgm = this.assets.getSound('bgm'); // assign the BGM generator function
    if (!this.audio.muted && this.audio.bgm) this.audio.startBacksound();

    // core scenes
    this.scenes.register('boot', BootScene);
    this.scenes.register('loading', LoadingScene);
    registerAllScenes(this);

    this.first_scene = this.scenes.getRouteKey(this.first_scene || 'home');
    this.scenes.switchTo(this.first_scene, null, { updateRoute: true });
    requestAnimationFrame(t => this._loop(t));
  }
  _loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    let dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    dt = Math.min(dt, 0.25); // guard against huge jumps (tab backgrounded, etc.)

    if (!this.paused) {
      this.accumulator += dt;
      while (this.accumulator >= this.fixedStep) {
        this.tweens.update(this.fixedStep);
        this.animations.update(this.fixedStep);
        this.scenes.update(this.fixedStep);
        this.accumulator -= this.fixedStep;
      }
    }
    this._render();
    requestAnimationFrame(t => this._loop(t));
  }
  _render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.scenes.render(ctx);
    this.ui.draw(ctx);
  }
}

/* Start the engine once the DOM is ready. Works directly from file://. */
window.addEventListener('DOMContentLoaded', () => { window.game = new Game(); });