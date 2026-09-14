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

    g.ui.add(
      new Container({
        x: 100,
        y: 100,
        width: 500,
        height: 500,
        src: 'audio_off',
        assets: g.assets,
        children: [
          new Label({
            x: 0,
            y: 0,
            anchorX: 'center',
            anchorY: 'center',
            width: 100,
            height: 100,
            text: 'Test Label'
          })
        ]
      })
    );

    // ImageView 2
    // g.ui.add(
    //   new ImageView({
    //   x: 0,
    //   y: 0,
    //   anchorX: 'left',
    //   anchorY: 'top',
    //   width: 300,
    //   height: 200,
    //   src: 'car',
    //   assets: g.assets
    // })
    // );
  }

  render(ctx) {
    setBackgroundImage(ctx, this.game.assets, 'background');
  }
}