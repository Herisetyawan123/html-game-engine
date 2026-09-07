
class LoadingScene extends Scene {
  nextScene = '404';  // Change this to the next scene you want to load after the loading screen.
  // No real assets to fetch (everything is already registered), so this
  // scene simply demonstrates a loading bar / minimum splash duration.
  // fixx error "Uncaught ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor"
  create(data) {
    const g = this.game;
    this.nextScene = g.first_scene || '404';
    this.progress = 0;
    this.bar = new ProgressBar({ x: 'center', y: 'center', width: 400, height: 24 }, null, 400, 24, 0);
    this.label = new Label({ x: 'center', y: 'center', text: 'Loading...' }, null, 'Loading...', { align: 'center', font: '32px sans-serif' });
  }
  update(dt) {
    this.progress = Math.min(1, this.progress + dt * 1.4);
    this.bar.value = this.progress;
    if (this.progress >= 1) this.game.scenes.switchTo(this.nextScene);
  }
  render(ctx) {
    ctx.fillStyle = '#111827'; ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    this.label.draw(ctx);
    this.bar.draw(ctx);
  }
}