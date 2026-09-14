class PlayTwoScene extends Scene {
  create() {
    const g = this.game;
    // expose scene reference for callbacks
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

    // ImageView 2
    g.ui.add(
      new ImageView({
      x: 352,
      y: 42,
      anchorX: 'center',
      anchorY: 'center',
      width: 449,
      height: 499,
      src: 'int_5/page_2/png/attire_panel',
      assets: g.assets
    })
    );

    // ImageView 3
    g.ui.add(
      new ImageView({
      x: 200,
      y: 80,
      anchorX: 'left',
      anchorY: 'top',
      width: 340,
      height: 60,
      src: 'int_5/ui/hot_days_statment',
      assets: g.assets
    })
    );

    // ImageView 4 (character)
    const characterView = new ImageView({
      x: 331,
      y: 239,
      anchorX: 'left',
      anchorY: 'top',
      width: 159,
      height: 427,
      src: 'int_5/page_1/png/character01',
      assets: g.assets
    });
    // store base src for wear version and expose to scene
    characterView._baseSrc = 'int_5/page_1/png/character01';
    scene.characterView = characterView;
    g.ui.add(characterView);

    // Outfit options list
    const outfitOptions = [
      {
        x: 771,
        y: 178,
        anchorX: 'left',
        anchorY: 'top',
        width: 200,
        height: 200,
        src: 'int_5/page_1/png/baju_kemeja',
        is_right: false,
      },
      {
        x: 1001,
        y: 174,
        anchorX: 'left',
        anchorY: 'top',
        width: 200,
        height: 200,
        src: 'int_5/page_1/png/selipar',
        is_right: true,
      },
      {
        x: 779,
        y: 423,
        anchorX: 'left',
        anchorY: 'top',
        width: 200,
        height: 200,
        src: 'int_5/page_1/png/short_pant',
        is_right: true,
      },
      {
        x: 1002,
        y: 421,
        anchorX: 'left',
        anchorY: 'top',
        width: 200,
        height: 200,
        src: 'int_5/page_1/png/baju01',
        is_right: true,
      }
    ];

    // Track selected outfit buttons (max 3)
    this.selectedOutfitCount = 0;
    this.outfitButtons = [];
    // scene reference already defined above

    // Helper: shake a button (quick jitter) and play wrong VO
    const shakeAndWrong = (button) => {
      // Play wrong sound
      const wrongSrc = g.assets.getSound('vo/wrong');
      if (wrongSrc) g.audio.play(wrongSrc);
      // Simple shake using tweens (5 quick shakes)
      const originalX = button.x;
      const originalY = button.y;
      const magnitude = 5;
      const shakeDuration = 0.05; // 50ms per half shake
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

    outfitOptions.forEach(
      (opt) => {
        const btn = new ImageButton({
          // store correctness for later shake check
          // _isRight: opt.is_right, // removed, will set after creation
          x: opt.x,
          y: opt.y,
          anchorX: opt.anchorX,
          anchorY: opt.anchorY,
          width: opt.width,
          height: opt.height,
          src: opt.src,
          assets: g.assets,
          onClick: (self) => {
            // Toggle selection state
            if (self._selected) {
              // Unselect: revert to original image and size
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
              // clear correctness flag
              delete self._isCorrect;
              scene.selectedOutfitCount--;
            } else {
              // Select: apply scaling and optional glow
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
              // store correctness for this selected button
              self._isCorrect = opt.is_right;
              scene.selectedOutfitCount++;

              // If this is the third selection and the button is not correct, shake and play wrong VO
              if (scene.selectedOutfitCount === 3) {
                // If any selected button is wrong, shake all selected and play wrong VO
                const anyWrong = scene.outfitButtons.some((b) => b._selected && !b._isCorrect);
                if (anyWrong) {
                  scene.outfitButtons.forEach((b) => {
                    if (b._selected) {
                      shakeAndWrong(b);
                    }
                  });
                } else {
                  // All selected are correct: play correct VO and animate moving to character
                  const correctSrc = g.assets.getSound('vo/you_dressed_the_pupils_correctly');
                  if (correctSrc) g.audio.play(correctSrc);
                  const targetX = 331; // character position X
                  const targetY = 239; // character position Y
                  scene.outfitButtons.forEach((b) => {
                    if (b._selected) {
                      // Move button to character position
                      g.tweens.create(b)
                        .to({ x: targetX, y: targetY }, 0.4, Easing.easeOutQuad)
                        .start();
                    }
                  });
                  // After animation finishes, change character view to wear version & hide buttons
                  setTimeout(() => {
                    if (scene.characterView) {
                      const charWearSrc = `${scene.characterView._baseSrc}_wear`;
                      scene.characterView.setImage(charWearSrc, {
                        x: scene.characterView.x - 100,
                        y: scene.characterView.y - 20,
                        anchorX: scene.characterView.anchorX,
                        anchorY: scene.characterView.anchorY,
                        width: scene.characterView.width + 150,
                        height: scene.characterView.height + 50,
                        assets: g.assets,
                      });
                    }
                    scene.outfitButtons.forEach((b) => {
                      if (b._selected) {
                        b.visible = false;
                      }
                    });
                  }, 450);
                  // Switch after animation and VO (add slight delay)
                  setTimeout(() => {
                    g.scenes.switchTo('playTwo');
                  }, 1000);
                }
              }
            }
            // Update disabled state for all outfit buttons based on selection count
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
        // assign properties for later use
        btn._isRight = opt.is_right;
        btn._baseSrc = opt.src;
        scene.outfitButtons.push(btn);
      }
    );
  }

  render(ctx) {
    setBackgroundImage(ctx, this.game.assets, 'int_5/page_3/png/background');
  }
}