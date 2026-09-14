class EndScene extends Scene {
  create() {
    this.game.audio.play(this.game.assets.getSound('vo/female_congratulation'))
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
      keyOn: 'homepage/png/audio_on',
      keyOff: 'homepage/png/audio_off',
      value: !g.audio.muted,
      assets: g.assets,
      onChange: (v) => { 
        if(g.audio.muted)
        {
          g.audio.startBacksound();
        }else{
          g.audio.pauseBacksound();
        }
      }
    })
    );

    // ImageView 2
    g.ui.add(
      new ImageView({
      x: 0,
      y: -100,
      anchorX: 'center',
      anchorY: 'center',
      width: 450,
      height: 300,
      src: 'page_2/png/congrats_icon',
      assets: g.assets
    })
    );

    // ImageButton 3
    g.ui.add(
      new ImageButton({
      x: 0,
      y: 100,
      anchorX: 'center',
      anchorY: 'center',
      width: 100,
      height: 100,
      src: 'page_2/png/replay_button',
      assets: g.assets,
      onClick: () => { 
        g.scenes.switchTo('home')
       }
    })
    );
  }

  render(ctx) {
    setBackgroundImage(ctx, this.game.assets, 'homepage/png/background');
  }
}