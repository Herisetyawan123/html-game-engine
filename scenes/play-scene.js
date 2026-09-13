class PlayScene extends Scene {
  create() {
    const g = this.game;

    // ToggleImage 2
    g.ui.add(
      new ToggleImage({
      x: 80,
      y: 80,
      anchorX: 'left',
      anchorY: 'top',
      width: 100,
      height: 100,
      keyOn: 'int_2/home_page/audio_on',
      keyOff: 'int_2/home_page/audio_off',
      value: true,
      assets: g.assets,
      onChange: (v) => { /* TODO */ }
    })
    );


    // ImageView 4
    g.ui.add(
      new ImageView({
      x: 50,
      y: 80,
      anchorX: 'center',
      anchorY: 'top',
      width: 1000,
      height: 450,
      src: 'int_2/page_1/top_panel',
      assets: g.assets
    })
    );

    // ImageButton 3
    g.ui.add(
      new ImageButton({
      x: 50,
      y: 130,
      anchorX: 'center',
      anchorY: 'top',
      width: 250,
      height: 150,
      src: 'int_2/ui/activities/play_kite',
      assets: g.assets,
      onClick: () => { /* TODO */ }
    })
    );

    // ImageView 1
    g.ui.add(
      new ImageView({
      x: 50,
      y: -100,
      anchorX: 'center',
      anchorY: 'bottom',
      width: 500,
      height: 80,
      src: 'int_2/ui/answer_empty/sunday_panel',
      assets: g.assets
    })
    );



  }

  render(ctx) {
    setBackgroundImage(ctx, this.game.assets, 'int_2/page_1/background_1');
  }
}