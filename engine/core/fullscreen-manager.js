/* ============================ FullscreenManager ============================ */
/* Guarantees fullscreen is only ever requested ONCE per application lifetime. */
class FullscreenManager {
  constructor(overlay_fs, btn_fs) { 
    this.requested = false;
    this.overlay_fs = overlay_fs;
    this.btn_fs = btn_fs;
    if (game_config.fullscreen)
    {
      this.overlay_fs.classList.remove('hidden');
    }
  }
  requestOnce() {
    if (this.requested) return;
    this.requested = true;
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen ||
                el.mozRequestFullScreen || el.msRequestFullscreen;
    if (req) { try { req.call(el).catch(() => {}); } catch (e) {} }
  }
  eventAfterFullscreen(open, exit)
  {
    this.btn_fs.addEventListener('click', () => {
      this.requestOnce();
      this.overlay_fs.classList.toggle('hidden');
      open();
    });

    document.addEventListener("fullscreenchange", () => {
        if (document.fullscreenElement) {
            this.requested = true;
        } else {
            this.requested = false;
            this.overlay_fs.classList.toggle('hidden')
            exit();
        }
    });
  }
}
