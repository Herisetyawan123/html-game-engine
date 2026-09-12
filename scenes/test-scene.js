class TestScene extends Scene {
  create() {
    const g = this.game;

    // Label 1
    g.ui.add(
      new Label({
      x: 0,
      y: 0,
      anchorX: 'center',
      anchorY: 'center',
      width: 200,
      height: 50,
      text: 'Test Label'
    })
    );

    // ImageView 2
    g.ui.add(
      new ImageView({
      x: 0,
      y: 0,
      anchorX: 'left',
      anchorY: 'top',
      width: 300,
      height: 200,
      src: 'car',
      assets: g.assets
    })
    );
  }

  render(ctx) {
    setBackgroundImage(ctx, this.game.assets, 'bg');
  }
}