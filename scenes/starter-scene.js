class StarterScene extends Scene {
  create() {
    const g = this.game;
    g.ui.add(
      new Label({
        x: 0,
        y: 0,
        anchorX: 'center',
        anchorY: 'middle',
        text: 'Centered + 100px right'
      })
    );
    const car = g.assets.getImage('car');
    g.ui.add(
      new ImageView({
        x: 0,
        y: 0,
        anchorX: 'center',
        anchorY: 'middle',
        imageKey: 'car',
        width: 200,
        height: 200,
        src: car
      })
    );
    g.ui.add(
      new ImageView({
        x: 0,
        y: 0,
        anchorX: 'right',
        anchorY: 'middle',
        imageKey: 'car',
        width: 200,
        height: 200,
        src: "car",
        assets: g.assets
      })
    );
  }
  render(ctx) {
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
  }
}