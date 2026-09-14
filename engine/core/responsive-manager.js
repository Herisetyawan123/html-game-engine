class ResponsiveManager {
  constructor(canvas, container, baseWidth, baseHeight) {
    this.canvas = canvas;
    this.container = container;
    this.baseWidth = baseWidth;
    this.baseHeight = baseHeight;

    this.resize();

    window.addEventListener('resize', () => this.resize());

    window.addEventListener(
      'orientationchange',
      () => setTimeout(() => this.resize(), 100)
    );
  }

  resize() {
    const ww = window.innerWidth;
    const wh = window.innerHeight;

    // CSS/display size
    const scale = Math.min(
      ww / this.baseWidth,
      wh / this.baseHeight
    );

    const w = Math.floor(this.baseWidth * scale);
    const h = Math.floor(this.baseHeight * scale);

    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';

    // Physical render resolution
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = Math.floor(this.baseWidth * dpr);
    this.canvas.height = Math.floor(this.baseHeight * dpr);

    const ctx = this.canvas.getContext('2d');

    // Keep game coordinates at 1280 × 720
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}