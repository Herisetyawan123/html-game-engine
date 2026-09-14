class PlayScene extends Scene {
  question_active = 0;
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

  questions = [
    {
      correct_answer: 1,
      bucket_correct: 'page_1/png/healthy_lettuce_1',
      options: [
        {
          x: -430,
          y: -150,
          anchorX: 'right',
          anchorY: 'bottom',
          width: 200,
          height: 100,
          key: 'fries',
          src: 'page_1/png/fries',
        },
        {
            x: -150,
            y: -120,
            anchorX: 'right',
            anchorY: 'bottom',
            width: 200,
            height: 150,
            key: 'lettuce',
            src: 'page_1/png/lettuce',
        },
      ]
    },
    {
      correct_answer: 1,
      bucket_correct: 'page_1/png/healthy_milk_1',
      options: [
        {
          x: -430,
          y: -150,
          anchorX: 'right',
          anchorY: 'bottom',
          width: 200,
          height: 100,
          key: 'piza',
          src: 'page_1/png/piza',
        },
        {
            x: -150,
            y: -120,
            anchorX: 'right',
            anchorY: 'bottom',
            width: 200,
            height: 150,
            key: 'milk',
            src: 'page_1/png/milk',
        },
      ]
    }
  ]
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
  
  question()
  {
    return this.questions[this.question_active];
  }
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

    console.log(this.question())
    // Loop all button
    for (let index = 0; index < this.question().options.length; index++) {
      const option = this.question().options[index];
      const button = new ImageButton({
          ...option,
          assets: g.assets,
          onClick: (self) => { 
            this.handleClick(self, index)
          }
        });
      g.ui.add(button);
    }
  }

  _delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async _playAndWait(src, extraMs = 200) {
    if (!src) return;
    let ms = 1000;
    try {
      const d = await this.game.audio.getAudioDuration(src);
      if (Number.isFinite(d) && d > 0) ms = d * 1000;
    } catch (e) {}
    try { this.game.audio.play(src); } catch (e) {}
    await this._delay(ms + extraMs);
  }

  resetToInitial(self) {
    const g = this.game;
    // kembalikan character ke awal
    this.character.setImage('page_1/png/carackter_strong', {
      x: 200,
      y: 210,
      anchorX: 'left',
      anchorY: 'top',
      width: 320,
      height: 460,
    });
    // kembalikan bucket ke awal
    this.bucket.setImage('page_1/png/blue_basket', {
      x: -260,
      y: 260,
      anchorX: 'right',
      anchorY: 'top',
      width: 200,
      height: 150,
    });
    // aktifkan lagi semua button
    this.question().options.forEach((data) => {
      const elButton = g.ui.getElementByKey(data.key);
      if (!elButton) return;
      elButton.disabled = false;
      elButton.opacity = 1;
    });

    self.opacity = 1;
    this._locking = false;
  }

  async handleClick(self, index)
  {
    if (this._locking) return;
    this._locking = true;
    const g = this.game;
    let audio = null;
    let character = null
    audio = this.options[this.question().correct_answer == index ? 'correct' : 'wrong'].audio;
    character = this.options[this.question().correct_answer == index ? 'correct' : 'wrong'].character;

    const src = g.assets.getSound(audio);
    if(audio && character && src)
    {

      // disabled button
      this.question().options.forEach(data => {
        const elButton = g.ui.getElementByKey(data.key);
        if (!elButton) return;
        elButton.disabled = true;
        elButton.opacity = 0.7;
      });

      // play music — tunggu sampai selesai
      const playPromise = this._playAndWait(src);
      // ganti character langsung biar terlihat saat audio jalan
      this.character.setImage(character);
      if(this.question().correct_answer == index)
      {
        // scale up glow biar terlihat sama besar, tapi center-nya tetap
        const scale = 1.4;
        const baseW = 200, baseH = 150;
        const baseX = -260, baseY = 260;
        const newW = Math.round(baseW * scale);
        const newH = Math.round(baseH * scale);
        const cx = BASE_WIDTH + baseX - baseW / 2;
        const cy = baseY + baseH / 2;
        this.bucket.setImage(this.question().bucket_correct, {
          x: Math.round(cx + newW / 2 - BASE_WIDTH),
          y: Math.round(cy - newH / 2),
          anchorX: 'right',
          anchorY: 'top',
          width: newW,
          height: newH,
        });
        self.opacity = 0;
      }

      // setelah audio selesai balik lagi ke awal
      await playPromise;
      this.resetToInitial(self);
      return;
    }
    this._locking = false;
  }

  render(ctx) {
    setBackgroundImage(ctx, this.game.assets, 'page_1/png/background');
  }
}