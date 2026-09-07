class CreditsScene extends Scene {
  create() {
    const g = this.game;
    g.ui.add(new Label({ x: 'center', y: 140, text: 'CREDITS' }, null, 'CREDITS', { align: 'center', font: 'bold 40px sans-serif' }));
    g.ui.add(new Label({ x: 'center', y: 220, text: 'Built with the Offline HTML5 Game Framework' }, null, 'Built with the Offline HTML5 Game Framework', { align: 'center', font: '22px sans-serif' }));
    g.ui.add(new Label({ x: 'center', y: 260, text: 'No external dependencies. Runs entirely from file://' }, null, 'No external dependencies. Runs entirely from file://', { align: 'center', font: '20px sans-serif', color: '#94a3b8' }));
    g.ui.add(new Button({ x: 'center', y: 360, width: 280, height: 64, label: 'BACK', onClick: () => g.scenes.switchTo('menu') }));
  }
  render(ctx) { drawBackdrop(ctx, this.game.assets); }
}