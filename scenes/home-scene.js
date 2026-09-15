class HomeScene extends Scene {
  toggle = new ToggleImage({
      x: 80,
      y: 80,
      anchorX: 'left',
      anchorY: 'top',
      width: 100,
      height: 100,
      keyOn: 'int_2/home_page/audio_on',
      keyOff: 'int_2/home_page/audio_off',
      value: !this.game.audio.muted,
      assets: this.game.assets,
      onChange: (v) => { 
        console.log(this.game.audio.muted);
        if(this.game.audio.muted)
        {
          this.game.audio.startBacksound();
        }else{
          this.game.audio.pauseBacksound();
        }
      }
    })
  create() {
    const g = this.game;

    // ImageView 1
    g.ui.add(
      new ImageView({
        x: 0,
        y: 100,
        anchorX: 'center',
        anchorY: 'top',
        width: 400,
        height: 100,
        src: 'int_2/home_page/title01_1',
        assets: g.assets
      })
    );

    // ImageView 2
    g.ui.add(
      new ImageView({
      x: 0,
      y: 250,
      anchorX: 'center',
      anchorY: 'top',
      width: 600,
      height: 60,
      src: 'int_2/home_page/title02_1',
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
      width: 150,
      height: 80,
      src: 'int_2/home_page/start_button',
      assets: g.assets,
      onClick: () => { 
        g.scenes.switchTo("play");
      }
    })
    );

    // ToggleImage 4
    g.ui.add(
      this.toggle
    );
  }

  render(ctx) {
    this.toggle.value = !this.game.audio.muted;
    setBackgroundImage(ctx, this.game.assets, 'int_2/home_page/background_1');
  }
}