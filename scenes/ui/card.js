
// A simple card object used only by GameScene - a template for future
// custom game objects. Note it exposes contains() so it can be registered
// directly with InputManager just like a UI element.
class Card {
  constructor(x, y, size, id, imageKey) {
    this.x = x; this.y = y; this.size = size; this.id = id; this.imageKey = imageKey;
    this.flipped = false; this.matched = false; this.scaleX = 1;
    this.active = true; this.visible = true;
  }
  contains(px, py) { return px >= this.x && px <= this.x + this.size && py >= this.y && py <= this.y + this.size; }
  draw(ctx, assets) {
    ctx.save();
    ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
    ctx.scale(this.scaleX, 1);
    roundRect(ctx, -this.size / 2, -this.size / 2, this.size, this.size, 10);
    if (this.flipped || this.matched) {
      ctx.fillStyle = '#1f2937'; ctx.fill();
      const img = assets.getImage(this.imageKey);
      if (img) { const pad = 10; ctx.drawImage(img, -this.size / 2 + pad, -this.size / 2 + pad, this.size - pad * 2, this.size - pad * 2); }
    } else {
      ctx.fillStyle = '#334155'; ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('?', 0, 4);
    }
    ctx.restore();
  }
}