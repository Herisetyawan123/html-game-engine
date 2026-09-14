class StarterScene extends Scene {
  create() {
    const g = this.game;

    // ToggleImage 1
    g.ui.add(
      new ToggleImage({
        x: 80,
        y: 80,
        anchorX: 'left',
        anchorY: 'top',
        width: 100,
        height: 100,
        keyOn: 'home_page/audio_on',
        keyOff: 'home_page/audio_off',
        value: !g.audio.muted,
        assets: g.assets,
        onChange: (v) => { 
          if(g.audio.muted)
          {
            g.audio.startBacksound();
          }else{
            g.audio.pasueBacksound();
          }
        }
      })
    );

    // ImageView 2
    g.ui.add(
      new ImageView({
      x: 0,
      y: 100,
      anchorX: 'center',
      anchorY: 'top',
      width: 500,
      height: 200,
      src: 'home_page/title01',
      assets: g.assets
    })
    );

    // ImageView 3
    g.ui.add(
      new ImageView({
      x: 0,
      y: 0,
      anchorX: 'center',
      anchorY: 'center',
      width: 450,
      height: 70,
      src: 'home_page/title02',
      assets: g.assets
    })
    );

    // ImageButton 4
    g.ui.add(
      new ImageButton({
      x: 0,
      y: 100,
      anchorX: 'center',
      anchorY: 'center',
      width: 150,
      height: 80,
      src: 'home_page/start_button',
      assets: g.assets,
      onClick: () => { 
        g.scenes.switchTo('play')
       }
    })
    );
  }

  render(ctx) {
    setBackgroundImage(ctx, this.game.assets, 'home_page/background_01');
  }
}