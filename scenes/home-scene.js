class HomeScene extends Scene {
  toggle = new ToggleImage({
        x: 80,
        y: 80,
        anchorX: 'left',
        anchorY: 'top',
        width: 100,
        height: 100,
        keyOn: 'homepage/png/audio_on',
        keyOff: 'homepage/png/audio_off',
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

    // ToggleImage 1
    g.ui.add(
      this.toggle
    );

    // Character
    g.ui.add(
      new ImageView({
      x: 150,
      y: 260,
      anchorX: 'left',
      anchorY: 'top',
      width: 250,
      height: 400,
      src: 'homepage/png/character01',
      assets: g.assets
    })
    );

    // ImageView 2
    g.ui.add(
      new ImageView({
      x: 0,
      y: 120,
      anchorX: 'center',
      anchorY: 'top',
      width: 550,
      height: 100,
      src: 'homepage/png/title01',
      assets: g.assets
    })
    );

    // ImageView 3
    g.ui.add(
      new ImageView({
      x: 0,
      y: 250,
      anchorX: 'center',
      anchorY: 'top',
      width: 350,
      height: 60,
      src: 'homepage/png/title02',
      assets: g.assets
    })
    );

    // ImageButton 4
    g.ui.add(
      new ImageButton({
      x: 0,
      y: 80,
      anchorX: 'center',
      anchorY: 'center',
      width: 150,
      height: 70,
      src: 'homepage/png/start_button',
      assets: g.assets,
      onClick: () => { 
        g.scenes.switchTo('play');
       }
    })
    );
  }

  render(ctx) {
    this.toggle.value = !this.game.audio.muted;
    setBackgroundImage(ctx, this.game.assets, 'homepage/png/background');
  }
}