class NotFoundScene extends Scene {
  create() {
    const g = this.game;
    g.ui.add(new Label({ x: 'center', y: 300, text: 'Scene Not Found' }, null, 'Scene Not Found', { align: 'center', font: 'bold 40px sans-serif' }));
    g.ui.add(new Label({ x: 'center', y: 360, text: 'The requested scene could not be found.' }, null, 'The requested scene could not be found.', { align: 'center', font: '22px sans-serif' }));
  }
  render(ctx) { drawBackdrop(ctx, this.game.assets); }
}