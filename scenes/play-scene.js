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

    // ImageView 4
    g.ui.add(
      new ImageView({
      x: 331,
      y: 239,
      anchorX: 'left',
      anchorY: 'top',
      width: 159,
      height: 427,
      src: 'int_5/page_1/png/character01',
      assets: g.assets
    })
    );

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
    const scene = this;
    outfitOptions.forEach(
      (opt) => {
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
              scene.selectedOutfitCount++;
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
        scene.outfitButtons.push(btn);
      }
    );
  }

  render(ctx) {
    setBackgroundImage(ctx, this.game.assets, 'int_5/page_3/png/background');
  }
}