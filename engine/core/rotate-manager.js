/* ============================== RotateManager =============================== */
/* Mandatory mobile-portrait lock. Desktop is entirely unaffected: the overlay
   never shows and fullscreen is never auto-requested there. */
class RotateManager {
  constructor(overlayEl, fullscreenManager, onLandscape, onPortrait) {
    this.overlay = overlayEl;
    this.fs = fullscreenManager;
    this.onLandscape = onLandscape;
    this.onPortrait = onPortrait;
    this.isMobile = isMobileDevice();
    this.wasPortrait = false;
    if (this.isMobile) {
      window.addEventListener('resize', () => this.check());
      window.addEventListener('orientationchange', () => setTimeout(() => this.check(), 150));
    }
    this.check(true);
  }
  isPortrait() { return window.innerHeight > window.innerWidth; }
  check(initial = false) {
    if (!this.isMobile) { this.overlay.style.display = 'none'; return; }
    const portrait = this.isPortrait();
    if (portrait) {
      this.overlay.style.display = 'flex';
      if (!this.wasPortrait || initial) this.onPortrait && this.onPortrait();
      this.wasPortrait = true;
    } else {
      this.overlay.style.display = 'none';
      if (this.wasPortrait || initial) {
        // this.fs.requestOnce();          // requested at most once, ever
        this.onLandscape && this.onLandscape();
      }
      this.wasPortrait = false;
    }
  }
}
