class PlayScene extends Scene {
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
      keyOn: 'int_2/home_page/audio_on',
      keyOff: 'int_2/home_page/audio_off',
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

    // ImageButton 2
    g.ui.add(
      new ImageButton({
      x: 80,
      y: -40,
      anchorX: 'center',
      anchorY: 'bottom',
      width: 450,
      height: 80,
      src: 'int_2/ui/answer_empty/sunday_panel',
      assets: g.assets,
      onClick: () => { /* TODO */ }
    })
    );

    // ImageButton 3
    g.ui.add(
      new ImageButton({
      x: 80,
      y: 90,
      anchorX: 'center',
      anchorY: 'top',
      width: 1070,
      height: 500,
      src: 'int_2/page_1/top_panel',
      assets: g.assets,
      onClick: () => { /* TODO */ }
    })
    );

    // ImageButton 4
    g.ui.add(
      new ImageButton({
      x: 80,
      y: 130,
      anchorX: 'center',
      anchorY: 'top',
      width: 250,
      height: 180,
      src: 'int_2/ui/activities/play_kite',
      assets: g.assets,
      onClick: () => { /* TODO */ }
    })
    );

    // ImageButton 5
    g.ui.add(
      new ImageButton({
      x: -210,
      y: 130,
      anchorX: 'center',
      anchorY: 'top',
      width: 250,
      height: 180,
      src: 'int_2/ui/activities/read_book',
      assets: g.assets,
      onClick: () => { /* TODO */ }
    })
    );

    // ImageButton 6
    g.ui.add(
      new ImageButton({
      x: 370,
      y: 130,
      anchorX: 'center',
      anchorY: 'top',
      width: 250,
      height: 180,
      src: 'int_2/ui/activities/ride_bike',
      assets: g.assets,
      onClick: () => { /* TODO */ }
    })
    );

    // ImageButton 7
    g.ui.add(
      new ImageButton({
      x: 210,
      y: 350,
      anchorX: 'center',
      anchorY: 'top',
      width: 250,
      height: 180,
      src: 'int_2/ui/activities/play_with_friends',
      assets: g.assets,
      onClick: () => { /* TODO */ }
    })
    );

    // ImageButton 8
    g.ui.add(
      new ImageButton({
      x: -50,
      y: 350,
      anchorX: 'center',
      anchorY: 'top',
      width: 250,
      height: 180,
      src: 'int_2/ui/activities/play_sport',
      assets: g.assets,
      onClick: () => { /* TODO */ }
    })
    );

    // ImageButton 9
    g.ui.add(
      new ImageButton({
      x: 465,
      y: 350,
      anchorX: 'center',
      anchorY: 'top',
      width: 250,
      height: 180,
      src: 'int_2/ui/activities/play_hide_n_seek',
      assets: g.assets,
      onClick: () => { /* TODO */ }
    })
    );

    // ImageButton 10
    g.ui.add(
      new ImageButton({
      x: -305,
      y: 350,
      anchorX: 'center',
      anchorY: 'top',
      width: 250,
      height: 180,
      src: 'int_2/ui/activities/read_book',
      assets: g.assets,
      onClick: () => { /* TODO */ }
    })
    );
  }

  render(ctx) {
    setBackgroundImage(ctx, this.game.assets, 'int_2/page_2/background_1');
  }
}