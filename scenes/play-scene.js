class PlayScene extends Scene {
  active_question = 0;
  questions = [
    {
      answer_correct: 'int_2/ui/answer_correct/sunday_panel_answer',
      empty_answer: 'int_2/ui/answer_empty/sunday_panel',
      correct: 0,
    },
    {
      answer_correct: 'int_2/ui/answer_correct/monday_panel_answer',
      empty_answer: 'int_2/ui/answer_empty/monday_panel',
      correct: 1,
    },
    {
      answer_correct: 'int_2/ui/answer_correct/tuesday_panel_answer',
      empty_answer: 'int_2/ui/answer_empty/tuesday_panel',
      correct: 2,
    },
    {
      answer_correct: 'int_2/ui/answer_correct/thursday_panel_answer',
      empty_answer: 'int_2/ui/answer_empty/thursday_panel',
      correct: 3,
    },
    {
      answer_correct: 'int_2/ui/answer_correct/wednesday_panel_answer',
      empty_answer: 'int_2/ui/answer_empty/wednesday_panel',
      correct: 4,
    },
    {
      answer_correct: 'int_2/ui/answer_correct/friday_panel_answer',
      empty_answer: 'int_2/ui/answer_empty/friday_panel',
      correct: 5,
    },
    {
      answer_correct: 'int_2/ui/answer_correct/saturday_panel_answer',
      empty_answer: 'int_2/ui/answer_empty/saturday_panel',
      correct: 6,
    },
  ];

  activities = [
      { 
        x: -210, 
        y: 130, 
        anchorX: 'center', 
        anchorY: 'top', 
        width: 250, 
        height: 180, 
        src: 'int_2/ui/activities/read_book', 
        key: 'read_book'
      },
      { 
        x: 80, 
        y: 130, 
        anchorX: 'center', 
        anchorY: 'top', 
        width: 250, 
        height: 180, 
        src: 'int_2/ui/activities/play_kite', 
        key: 'play_kite'
      },
      { 
        x: 370, 
        y: 130, 
        anchorX: 'center', 
        anchorY: 'top', 
        width: 250, 
        height: 180, 
        src: 'int_2/ui/activities/ride_bike', 
        key: 'ride_bike'
      },
      { 
        x: -305, 
        y: 350, 
        anchorX: 'center', 
        anchorY: 'top', 
        width: 250, 
        height: 180, 
        src: 'int_2/ui/activities/listen_music', 
        key: 'listen_music'
      },
      { 
        x: -50, 
        y: 350, 
        anchorX: 'center', 
        anchorY: 'top', 
        width: 250, 
        height: 180, 
        src: 'int_2/ui/activities/play_sport', 
        key: 'play_sport'
      },
      { 
        x: 210, 
        y: 350, 
        anchorX: 'center', 
        anchorY: 'top', 
        width: 250, 
        height: 180, 
        src: 'int_2/ui/activities/play_with_friends', 
        key: 'play_with_friends'
      },
      { 
        x: 465, 
        y: 350, 
        anchorX: 'center', 
        anchorY: 'top', 
        width: 250, 
        height: 180, 
        src: 'int_2/ui/activities/play_hide_n_seek', 
        key: 'play_hide_n_seek'
      },
  ];

  question_image = new ImageView({ 
      x: 80, 
      y: -40, 
      anchorX: 'center', 
      anchorY: 'bottom', 
      width: 650, 
      height: 80,
      assets: this.game.assets, 
      src: this.question().empty_answer
    });

  question()
  {
    if(this.active_question >= this.questions.length) return this.questions[0];
    return this.questions[this.active_question];
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
    
    g.ui.add(
      this.question_image
    );
    g.ui.add(
      new ImageView({ 
        x: 80, 
        y: 90, 
        anchorX: 'center', 
        anchorY: 'top', 
        width: 1070, 
        height: 500, 
        assets: g.assets,
        src: 'int_2/page_1/top_panel' 
      })
   );

    // Looping — manggilnya cukup sekali di sini
    this.activities.forEach((data, index) => {
      const btn = new ImageButton({
        ...data,
        assets: g.assets,
        onClick: (self) => {
          data.onClick?.(self);
          g.audio.play(g.assets.getSound('vo/correct'))
          this.handleClick(data, self, index);

        },
      });
      btn._baseSrc = data.src;
      g.ui.add(btn);
    });
  }

  handleClick(data, self, index)
  {
    const g = this.game;
    const base = self._baseSrc || data.src;
    self._baseSrc = base;
    if(index == this.question().correct)
    {
      if (self.src?.endsWith('_glow')) {
        self.src = base;
        self.y = data.y;
        self.height = data.height;
        self.width = data.width;
      } else {
        const glowSrc = `${base}_glow`;
        if (g.assets.getImage(glowSrc)) self.src = glowSrc;
        if(data.y < 350)
        {
          self.y = self.y * 0.5;
        }else{
          self.y = self.y * 0.82;
        }
        self.width = self.width *1.5;
        self.height = self.height *1.7;
      }

      // replace
      this.question_image.setImage(this.question().answer_correct, {
        x: 80, 
        y: 0, 
        anchorX: 'center', 
        anchorY: 'bottom', 
        width: 650, 
        height: 160,
      });

      setTimeout(() => {
        self.src = base;
        self.y = data.y;
        self.height = data.height;
        self.width = data.width;
        self.opacity = 0.7;
        self.disabled = true;
      }, 500)
    }
  }

  render(ctx) {
    setBackgroundImage(ctx, this.game.assets, 'int_2/page_2/background_1');
  }
}