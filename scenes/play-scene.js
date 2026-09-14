class PlayScene extends Scene {
  correct_answer = 1;
  options = {
    "wrong": {
      audio: 'vo/try_again_nh',
      character: 'page_1/png/character_tired'
    },
    "correct": {
      audio: 'vo/good_choice_nh',
      character: 'page_1/png/carackter_strong'
    },
  }
  character = new ImageView({
        x: 200,
        y: 210,
        anchorX: 'left',
        anchorY: 'top',
        width: 320,
        height: 460,
        src: 'page_1/png/carackter_strong',
        assets: this.game.assets
      });

  bucket = new ImageView({
        x: -260,
        y: 260,
        anchorX: 'right',
        anchorY: 'top',
        width: 200,
        height: 150,
        src: 'page_1/png/blue_basket',
        assets: this.game.assets
      })

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
      this.bucket
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
      onClick: () => { 
        this.handleClick(0)
       }
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
      onClick: () => { 
        this.handleClick(1)
       }
    })
    );
  }

  handleClick(index)
  {
    const g = this.game;
    let audio = null;
    let character = null
    audio = this.options[this.correct_answer == index ? 'correct' : 'wrong'].audio;
    character = this.options[this.correct_answer == index ? 'correct' : 'wrong'].character;

    const src = g.assets.getSound(audio);
    if(audio && character && src)
    {
      // play music
      g.audio.play(src);
      // replace character
      this.character.setImage(character);
      if(this.correct_answer == index)
      {
        // scale up glow biar terlihat sama besar, tapi center-nya tetap
        const scale = 1.4;
        const baseW = 200, baseH = 150;
        const baseX = -260, baseY = 260;
        const newW = Math.round(baseW * scale);
        const newH = Math.round(baseH * scale);
        const cx = BASE_WIDTH + baseX - baseW / 2;
        const cy = baseY + baseH / 2;
        this.bucket.setImage('page_1/png/healthy_lettuce_1', {
          x: Math.round(cx + newW / 2 - BASE_WIDTH),
          y: Math.round(cy - newH / 2),
          anchorX: 'right',
          anchorY: 'top',
          width: newW,
          height: newH,
        });
      }
    }
  }

  render(ctx) {
    setBackgroundImage(ctx, this.game.assets, 'page_1/png/background');
  }
}