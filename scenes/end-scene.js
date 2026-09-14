class EndScene extends Scene {
  create() {
    const g = this.game;

    const src = g.assets.getSound('vo/femaile_great')
    g.audio.play(src);

    // ToggleImage 1
    g.ui.add(
      new ToggleImage({
      x: 80,
      y: 80,
      anchorX: 'left',
      anchorY: 'top',
      width: 100,
      height: 100,
      keyOn: 'end_page/audio_on',
      keyOff: 'end_page/audio_off',
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
      width: 300,
      height: 300,
      src: 'end_page/great_icon',
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
      src: 'end_page/replay_button',
      assets: g.assets,
      onClick: () => { 
        g.scenes.switchTo('starter');
      }
    })
    );
  }

  render(ctx) {
    setBackgroundImage(ctx, this.game.assets, 'end_page/background_01');
  }
}