class PlayScene extends Scene {
  character = new ImageView({
        x: 200,
        y: 210,
        anchorX: 'left',
        anchorY: 'top',
        width: 320,
        height: 460,
        src: 'page_1/png/character_01',
        assets: this.game.assets
      });

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
      this.character
    );

    // ImageView 3
    g.ui.add(
      new ImageView({
      x: -260,
      y: 260,
      anchorX: 'right',
      anchorY: 'top',
      width: 200,
      height: 150,
      src: 'page_1/png/blue_basket',
      assets: g.assets
    })
    );

    // ImageButton 4
    g.ui.add(
      new ImageButton({
      x: -430,
      y: -150,
      anchorX: 'right',
      anchorY: 'bottom',
      width: 200,
      height: 100,
      src: 'page_1/png/fries',
      assets: g.assets,
      onClick: () => { /* TODO */ }
    })
    );

    // ImageButton 5
    g.ui.add(
      new ImageButton({
      x: -150,
      y: -120,
      anchorX: 'right',
      anchorY: 'bottom',
      width: 200,
      height: 150,
      src: 'page_1/png/lettuce',
      assets: g.assets,
      onClick: () => { /* TODO */ }
    })
    );
  }

  render(ctx) {
    setBackgroundImage(ctx, this.game.assets, 'page_1/png/background');
  }
}