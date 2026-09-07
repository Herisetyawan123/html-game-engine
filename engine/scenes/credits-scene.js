class CreditsScene extends Scene {
  create() {
    const g = this.game;
    g.ui.add(new Label(BASE_WIDTH / 2, 140, 'CREDITS', { align: 'center', font: 'bold 40px sans-serif' }));
    g.ui.add(new Label(BASE_WIDTH / 2, 220, 'Built with the Offline HTML5 Game Framework', { align: 'center', font: '22px sans-serif' }));
    g.ui.add(new Label(BASE_WIDTH / 2, 260, 'No external dependencies. Runs entirely from file://', { align: 'center', font: '20px sans-serif', color: '#94a3b8' }));
    g.ui.add(new Button(BASE_WIDTH / 2 - 140, 360, 280, 64, 'BACK', () => g.scenes.switchTo('menu')));
  }
  render(ctx) { drawBackdrop(ctx, this.game.assets); }
}