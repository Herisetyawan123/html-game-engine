
class GameScene extends Scene {
  create() {
    const g = this.game;
    this.score = 0; this.matchesFound = 0; this.locked = false; this.timeElapsed = 0;

    const shapeKeys = ['shape_circle', 'shape_square', 'shape_triangle', 'shape_star', 'shape_diamond', 'shape_hex'];
    let ids = [];
    shapeKeys.forEach((k, i) => { ids.push(i); ids.push(i); });
    shuffle(ids);

    this.cards = [];
    const cols = 4, rows = 3, size = 140, gapX = 20, gapY = 20;
    const startX = (BASE_WIDTH - (cols * size + (cols - 1) * gapX)) / 2;
    const startY = 180;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const cardId = ids[idx];
        const x = startX + c * (size + gapX);
        const y = startY + r * (size + gapY);
        const card = new Card(x, y, size, cardId, shapeKeys[cardId]);
        card.onPointerDown = () => this.tryFlip(card);
        this.cards.push(card);
        g.input.register(card);
      }
    }
    this.firstPick = null; this.secondPick = null;

    this.scoreLabel = g.ui.add(new Label({ x: 'start', y: 50, text: 'Score: 0' }, null, 'Score: 0', { font: '26px sans-serif' }));
    this.timeLabel = g.ui.add(new Label({ x: 'end', y: 50, text: 'Time: 0s' }, null, 'Time: 0s', { font: '26px sans-serif', align: 'right' }));
    g.ui.add(new Button({ x: 'center', y: 20, width: 120, height: 44, label: 'PAUSE', onClick: () => this.openPause() }, null, null, null, 'PAUSE', () => this.openPause(), { color: '#374151', hoverColor: '#1f2937', font: '20px sans-serif' }));
  }
  tryFlip(card) {
    const g = this.game;
    if (this.locked || card.flipped || card.matched || g.paused) return;
    card.flipped = true;
    g.audio.playClick();
    g.tweens.create(card).to({ scaleX: 0 }, 0.08).to({ scaleX: 1 }, 0.08).start();

    if (!this.firstPick) { this.firstPick = card; return; }
    this.secondPick = card;
    this.locked = true;
    if (this.firstPick.id === this.secondPick.id) {
      this.firstPick.matched = true; this.secondPick.matched = true;
      this.matchesFound++;
      this.score += 100;
      g.audio.playSuccess();
      this.scoreLabel.text = 'Score: ' + this.score;
      this.firstPick = null; this.secondPick = null; this.locked = false;
      if (this.matchesFound === 6) {
        g.storage.setHighScore(this.score);
        setTimeout(() => g.scenes.switchTo('result', { score: this.score, time: Math.floor(this.timeElapsed) }), 500);
      }
    } else {
      g.audio.playError();
      setTimeout(() => {
        this.firstPick.flipped = false;
        this.secondPick.flipped = false;
        this.firstPick = null; this.secondPick = null; this.locked = false;
      }, 700);
    }
  }
  openPause() {
    const g = this.game;
    g.paused = true;
    const popup = new Popup({ x: 'center', y: 'center', width: 440, height: 300, color: 'rgba(15,23,42,0.97)' });
    popup.add(new Label({ x: 'center', y: 180, text: 'PAUSED' }, null, 'PAUSED', { align: 'center', font: 'bold 32px sans-serif' }));
    popup.add(new Button({ x: 'center', y: 240, width: 300, height: 56, label: 'RESUME', onClick: () => { g.paused = false; g.ui.removePopup(popup); } }));
    popup.add(new Button({ x: 'center', y: 320, width: 300, height: 56, label: 'MAIN MENU', onClick: () => { g.paused = false; g.scenes.switchTo('menu'); } }, null, null, null, 'MAIN MENU', () => { g.paused = false; g.scenes.switchTo('menu'); }, { color: '#6b7280', hoverColor: '#4b5563' }));
    g.ui.addPopup(popup);
  }
  update(dt) {
    if (this.game.paused) return;
    this.timeElapsed += dt;
    this.timeLabel.text = 'Time: ' + Math.floor(this.timeElapsed) + 's';
  }
  render(ctx) {
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    this.cards.forEach(c => c.draw(ctx, this.game.assets));
  }
  destroy() { this.cards.forEach(c => this.game.input.unregister(c)); }
}