class PlayFiveScene extends Scene {
  create() {
    const g = this.game;
    const scene = this;

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

    // ImageView 2 (attire panel)
    g.ui.add(
      new ImageView({
      x: 352,
      y: 42,
      anchorX: 'center',
      anchorY: 'center',
      width: 449,
      height: 499,
      src: 'int_5/page_5/png/attire_panel',
      assets: g.assets
    })
    );

    // ImageView 3 (statement)
    g.ui.add(
      new ImageView({
      x: 200,
      y: 80,
      anchorX: 'left',
      anchorY: 'top',
      width: 340,
      height: 60,
      src: 'int_5/ui/sport_days_statement',
      assets: g.assets
    })
    );

    // ImageView 4 (character)
    const characterView = new ImageView({
      x: 331,
      y: 239,
      anchorX: 'left',
      anchorY: 'top',
      width: 255,
      height: 427,
      src: 'int_5/page_5/png/character_ana',
      assets: g.assets
    });
    characterView._baseSrc = 'int_5/page_5/png/character_ana';
    scene.characterView = characterView;
    g.ui.add(characterView);

    // Outfit options (from int_5/page_5)
    const outfitOptions = [
      {
        x: 800,
        y: 178,
        anchorX: 'left',
        anchorY: 'top',
        width: 180,
        height: 200,
        src: 'int_5/page_5/png/sport_shirt',
        is_right: true,
      },
      {
        x: 1000,
        y: 174,
        anchorX: 'left',
        anchorY: 'top',
        width: 180,
        height: 220,
        src: 'int_5/page_5/png/rain_coat',
        is_right: false,
      },
      {
        x: 830,
        y: 480,
        anchorX: 'left',
        anchorY: 'top',
        width: 100,
        height: 100,
        src: 'int_5/page_5/png/shoes',
        is_right: true,
      },
      {
        x: 1020,
        y: 421,
        anchorX: 'left',
        anchorY: 'top',
        width: 150,
        height: 200,
        src: 'int_5/page_5/png/sport_pant',
        is_right: true,
      }
    ];

    this.selectedOutfitCount = 0;
    this.outfitButtons = [];

    const shakeAndWrong = (button) => {
      const wrongSrc = g.assets.getSound('vo/wrong');
      if (wrongSrc) g.audio.play(wrongSrc);
      const originalX = button.x;
      const originalY = button.y;
      const magnitude = 5;
      const shakeDuration = 0.05;
      const shakes = 5;
      const tw = g.tweens.create(button);
      for (let i = 0; i < shakes; i++) {
        const dx = (Math.random() * 2 - 1) * magnitude;
        const dy = (Math.random() * 2 - 1) * magnitude;
        tw.to({ x: originalX + dx, y: originalY + dy }, shakeDuration, Easing.linear);
        tw.to({ x: originalX, y: originalY }, shakeDuration, Easing.linear);
      }
      tw.start();
    };

    outfitOptions.forEach((opt) => {
      const btn = new ImageButton({
        x: opt.x,
        y: opt.y,
        anchorX: opt.anchorX,
        anchorY: opt.anchorY,
        width: opt.width,
        height: opt.height,
        src: opt.src,
        assets: g.assets,
        onClick: (self) => {
          if (self._selected) {
            self.setImage(opt.src, {
              x: opt.x,
              y: opt.y,
              anchorX: opt.anchorX,
              anchorY: opt.anchorY,
              width: opt.width,
              height: opt.height,
              assets: g.assets,
            });
            self._selected = false;
            delete self._isCorrect;
            scene.selectedOutfitCount--;
          } else {
            const scaleFactor = 1.1;
            const newWidth = opt.width * scaleFactor;
            const newHeight = opt.height * scaleFactor;
            const newX = opt.x - (newWidth - opt.width) / 2;
            const newY = opt.y - (newHeight - opt.height) / 2;
            const nextSrc = opt.is_right ? `${opt.src}_glow` : opt.src;
            self.setImage(nextSrc, {
              x: newX,
              y: newY,
              anchorX: opt.anchorX,
              anchorY: opt.anchorY,
              width: newWidth,
              height: newHeight,
              assets: g.assets,
            });
            self._selected = true;
            self._isCorrect = opt.is_right;
            scene.selectedOutfitCount++;

            if (scene.selectedOutfitCount === 3) {
              const anyWrong = scene.outfitButtons.some((b) => b._selected && !b._isCorrect);
              if (anyWrong) {
                scene.outfitButtons.forEach((b) => {
                  if (b._selected) shakeAndWrong(b);
                });
              } else {
                const correctSrc = g.assets.getSound('vo/you_dressed_the_pupils_correctly');
                if (correctSrc) g.audio.play(correctSrc);
                const targetX = 331;
                const targetY = 239;
                scene.outfitButtons.forEach((b) => {
                  if (b._selected) {
                    g.tweens.create(b).to({ x: targetX, y: targetY }, 0.4, Easing.easeOutQuad).start();
                  }
                });
                setTimeout(() => {
                  if (scene.characterView) {
                    const charWearSrc = `${scene.characterView._baseSrc}_wear`;
                    scene.characterView.setImage(charWearSrc, {
                      x: scene.characterView.x - 50,
                      y: scene.characterView.y - 60,
                      anchorX: scene.characterView.anchorX,
                      anchorY: scene.characterView.anchorY,
                      width: scene.characterView.width + 60,
                      height: scene.characterView.height + 100,
                      assets: g.assets,
                    });
                  }
                  scene.outfitButtons.forEach((b) => {
                    if (b._selected) b.visible = false;
                  });
                }, 450);
                // Switch to End scene after success
                setTimeout(() => {
                  g.scenes.switchTo('end');
                }, 1000);
              }
            }
          }
          scene.outfitButtons.forEach((b) => {
            if (!b._selected && scene.selectedOutfitCount >= 3) {
              b.disabled = true;
              b.opacity = 0.7;
            } else {
              b.disabled = false;
              b.opacity = 1;
            }
          });
        }
      });
      g.ui.add(btn);
      btn._isRight = opt.is_right;
      btn._baseSrc = opt.src;
      scene.outfitButtons.push(btn);
    });
  }

  render(ctx) {
    setBackgroundImage(ctx, this.game.assets, 'int_5/page_5/png/background');
  }
}
