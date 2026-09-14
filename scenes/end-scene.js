class EndScene extends Scene {
  create() {
    const g = this.game;
    g.ui.add(
      new Label({
        x: 0,
        y: 140,
        anchorX: 'center',
        anchorY: 'top',
        text: 'EndScene',
        align: 'center',
        font: 'bold 36px sans-serif'
      })
    );
    g.ui.add(
      new Button({
        x: 0,
        y: 260,
        anchorX: 'center',
        anchorY: 'top',
        width: 280,
        height: 64,
        label: 'BACK',
        onClick: () => g.scenes.switchTo('home')
      })
    );
  }

  render(ctx) {
    drawBackdrop(ctx, this.game.assets);
  }
}
