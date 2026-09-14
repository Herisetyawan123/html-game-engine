class EndScene extends Scene {
  create() {
    const g = this.game;
    const src = g.assets.getSound('vo/female_nice')
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
      keyOn: 'int_5/homepage/png/audio_on',
      keyOff: 'int_5/homepage/png/audio_off',
      value: !this.game.audio.muted,
      assets: this.game.assets,
      onChange: (v) => { 
        if(this.game.audio.muted)
        {
          this.game.audio.startBacksound();
        }else{
          this.game.audio.pauseBacksound();
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
      src: 'int_5/last_page/nice_icon',
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
      src: 'int_5/last_page/replay_button',
      assets: g.assets,
      onClick: () => { g.scenes.switchTo('starter') }
    })
    );
  }

  render(ctx) {
    setBackgroundImage(ctx, this.game.assets, 'int_5/last_page/background');
  }
}