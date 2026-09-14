class StarterScene extends Scene {
  toggle = new ToggleImage({
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
      });
  create() {
    const g = this.game;
    g.ui.add(
      this.toggle
    );
    // ImageView 2
    g.ui.add(
      new ImageView({
      x: 0,
      y: 100,
      anchorX: 'center',
      anchorY: 'top',
      width: 515,
      height: 108,
      src: 'int_5/homepage/png/title01',
      assets: g.assets
    })
    );

    // ImageView 3
    g.ui.add(
      new ImageView({
      x: 0,
      y: -100,
      anchorX: 'center',
      anchorY: 'center',
      width: 201,
      height: 44,
      src: 'int_5/homepage/png/title02_1',
      assets: g.assets
    })
    );

    // ImageButton 4
    g.ui.add(
      new ImageButton({
      x: 0,
      y: 0,
      anchorX: 'center',
      anchorY: 'center',
      width: 123,
      height: 66,
      src: 'int_5/homepage/png/start_button',
      assets: g.assets,
      onClick: () => { g.scenes.switchTo('play') }
    })
    );
  }

  render(ctx) {
    // ToggleImage 1
    this.toggle.value = !this.game.audio.muted;
    setBackgroundImage(ctx, this.game.assets, 'int_5/homepage/png/background');
  }
}