/* ============================ ResponsiveManager =========================== */
/* Keeps a fixed internal render resolution and scales the canvas element via
   CSS to fit the window while preserving aspect ratio (letterboxing). */
class ResponsiveManager {
  constructor(canvas, container, baseWidth, baseHeight) {
    this.canvas = canvas;
    this.container = container;
    this.baseWidth = baseWidth;
    this.baseHeight = baseHeight;
    canvas.width = baseWidth;
    canvas.height = baseHeight;
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 100));
    this.resize();
  }
  resize() {
    const ww = window.innerWidth, wh = window.innerHeight;
    const scale = Math.min(ww / this.baseWidth, wh / this.baseHeight);
    const w = Math.floor(this.baseWidth * scale);
    const h = Math.floor(this.baseHeight * scale);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
  }
}