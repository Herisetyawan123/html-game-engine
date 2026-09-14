class PlayScene extends Scene {
  question_active = 0;
  questions = [
    {
      correct: 0,
      initial: 'page_1/initial',
      succes: 'page_1/success',
      options: [
        {
          src: 'page_1/panel_answer_a',
          option_clicked: 'page_1/right_answer_panel_glow'
        },
        {
          src: 'page_1/panel_answer_b',
          option_clicked: 'page_1/wrong_answer_panel'
        }
      ]
    },
    {
      correct: 1,
      initial: 'page_2/initial',
      succes: 'page_2/success',
      options: [
        {
          src: 'page_2/panel_answer_a',
          option_clicked: 'page_2/wrong_answer_panel'
        },
        {
          src: 'page_2/panel_answer_b',
          option_clicked: 'page_2/right_answer_panel_glow'
        }
      ]
    },
    {
      correct: 0,
      initial: 'page_3/initial',
      succes: 'page_3/success',
      options: [
        {
          src: 'page_3/panel_answer_a',
          option_clicked: 'page_3/right_answer_panel_glow'
        },
        {
          src: 'page_3/panel_answer_b',
          option_clicked: 'page_3/wrong_answer_panel'
        }
      ]
    },
    {
      correct: 0,
      initial: 'page_4/initial',
      succes: 'page_4/success',
      options: [
        {
          src: 'page_4/panel_answer_a',
          option_clicked: 'page_4/right_answer_panel_glow'
        },
        {
          src: 'page_4/panel_answer_b',
          option_clicked: 'page_4/wrong_answer_panel'
        }
      ]
    }
  ];

  _locking = false;
  _bgOverride = null;
  question()
  {
    return this.questions[this.question_active];
  }
  _delay(ms) { return new Promise((r) => setTimeout(r, ms)); }
  _playFeedbackAudio(isCorrect)
  {
    const g = this.game;
    const key = isCorrect ? 'vo/good_choice' : 'vo/wrong_answer';
    const src = g.assets.getSound(key);
    if (!src) { isCorrect ? g.audio.playSuccess() : g.audio.playError(); return this._delay(800); }
    g.audio.play(src);
    return g.audio.getAudioDuration(src).then((d) => this._delay(d * 1000 + 200)).catch(() => this._delay(1200));
  }
  _setOptionsEnabled(enabled)
  {
    const g = this.game;
    const q = this.question();
    if (!q) return;
    q.options.forEach((_, i) => {
      const el = g.ui.getElementByKey('opt_' + i);
      if (el) { el.disabled = !enabled; el.opacity = enabled ? 1 : 0.7; }
    });
  }
  _scaleOption(el, scaleX, scaleY)
  {
    if (!el) return;
    const sx = scaleX || 1;
    const sy = scaleY !== undefined ? scaleY : sx;
    if (sx === 1 && sy === 1) return;
    const oldW = el.width;
    const oldH = el.height;
    const newW = Math.round(oldW * sx);
    const newH = Math.round(oldH * sy);
    const dW = newW - oldW;
    const dH = newH - oldH;
    // jaga center tetap: anchor kanan/bawah geser +delta/2, kiri/atas -delta/2, center tetap
    if (el.anchorX === 'right' || el.anchorX === 'end' || el.anchorX === 'bottom') el.x += dW / 2;
    else if (el.anchorX === 'left' || el.anchorX === 'top' || el.anchorX === 'start') el.x -= dW / 2;
    if (el.anchorY === 'right' || el.anchorY === 'end' || el.anchorY === 'bottom') el.y += dH / 2;
    else if (el.anchorY === 'left' || el.anchorY === 'top' || el.anchorY === 'start') el.y -= dH / 2;
    el.width = newW;
    el.height = newH;
  }
  loadQuestion()
  {
    const g = this.game;
    const q = this.question();
    if (!q) return;
    this._bgOverride = null;
    this._locking = false;
    q.options.forEach((_, i) => g.ui.remove('opt_' + i));
    const ys = [-100, 50];
    q.options.forEach((opt, i) => {
      g.ui.add(new ImageButton({
        key: 'opt_' + i,
        x: -100,
        y: ys[i] !== undefined ? ys[i] : 50 + i * 150,
        anchorX: 'right',
        anchorY: 'center',
        width: 250,
        height: 100,
        src: opt.src,
        assets: g.assets,
        onClick: () => { this.handleClick(i); }
      }));
    });
    this._setOptionsEnabled(true);
  }
  async handleClick(index)
  {
    const g = this.game;
    if (this._locking) return;
    const q = this.question();
    if (!q) return;
    this._locking = true;
    this._setOptionsEnabled(false);
    const isCorrect = index === q.correct;
    const el = g.ui.getElementByKey('opt_' + index);
    const clicked = q.options[index];
    // panel berubah sesuai option_clicked yg diklik (benar maupun salah)
    if (el && clicked && clicked.option_clicked) el.src = clicked.option_clicked;
    if (el) el.opacity = 1;
    if (isCorrect) {
      // jika benar background ganti ke success + glow di-scaling biar kelihatan besar
      // panel 460x153, glow 623x315 -> glow butuh tinggi ekstra biar ga gepeng
      this._bgOverride = q.success || q.succes || null;
      this._scaleOption(el, 1.3, 1.65);
      await this._playFeedbackAudio(true);
      await this._delay(1000);
      // auto next question, habis semua masuk end scene
      this.question_active++;
      if (this.question_active >= this.questions.length) {
        g.scenes.switchTo('end');
        return;
      }
      this.loadQuestion();
    } else {
      // jika salah: wajib pencet lagi, tombol yg berubah kembali seperti semula
      await this._playFeedbackAudio(false);
      if (el && clicked) el.src = clicked.src;
      this._setOptionsEnabled(true);
      this._locking = false;
    }
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
        keyOn: 'home_page/audio_on',
        keyOff: 'home_page/audio_off',
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

    // Options dirender dari questions[question_active].options via loop
    this.loadQuestion();
  }

  render(ctx) {
    const q = this.question() || this.questions[this.questions.length - 1];
    const bg = this._bgOverride || (q && (q.initial || q.background)) || 'page_1/initial';
    setBackgroundImage(ctx, this.game.assets, bg);
  }
}