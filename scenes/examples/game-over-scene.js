class GameOverScene extends Scene {
  // Provided as a ready-to-use template for future games that need a
  // fail-state screen; the matching demo never triggers it.
  create() {
    const g = this.game;
    g.ui.add(new Label({ x: 'center', y: 220, text: 'GAME OVER' }, null, 'GAME OVER', { align: 'center', font: 'bold 44px sans-serif', color: '#ef4444' }));
    g.ui.add(new Button({ x: 'center', y: 320, width: 280, height: 64, label: 'RETRY', onClick: () => g.scenes.switchTo('game') }));
    g.ui.add(new Button({ x: 'center', y: 400, width: 280, height: 64, label: 'MAIN MENU', onClick: () => g.scenes.switchTo('menu') }, null, null, null, 'MAIN MENU', () => g.scenes.switchTo('menu'), { color: '#6b7280', hoverColor: '#4b5563' }));
  }
  render(ctx) { drawBackdrop(ctx, this.game.assets); }
}