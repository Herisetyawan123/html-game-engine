class GameOverScene extends Scene {
  // Provided as a ready-to-use template for future games that need a
  // fail-state screen; the matching demo never triggers it.
  create() {
    const g = this.game;
    g.ui.add(new Label(BASE_WIDTH / 2, 220, 'GAME OVER', { align: 'center', font: 'bold 44px sans-serif', color: '#ef4444' }));
    g.ui.add(new Button(BASE_WIDTH / 2 - 140, 320, 280, 64, 'RETRY', () => g.scenes.switchTo('game')));
    g.ui.add(new Button(BASE_WIDTH / 2 - 140, 400, 280, 64, 'MAIN MENU', () => g.scenes.switchTo('menu'), { color: '#6b7280', hoverColor: '#4b5563' }));
  }
  render(ctx) { drawBackdrop(ctx, this.game.assets); }
}