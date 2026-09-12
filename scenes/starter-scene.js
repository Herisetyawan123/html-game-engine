class StarterScene extends Scene {
  create() {
    const g = this.game;
    g.ui.add(
      new Label({
        x: 0,
        y: 0,
        anchorX: 'center',
        anchorY: 'middle',
        text: 'Centered + 100px right'
      })
    );
    const car = g.assets.getImage('car');
    g.ui.add(
      new ImageView({
        x: 0,
        y: 0,
        anchorX: 'center',
        anchorY: 'middle',
        imageKey: 'car',
        width: 200,
        height: 200,
        src: car,
        key: 'car_image',
      })
    );
    g.ui.add(
      new ImageView({
        x: 0,
        y: 0,
        anchorX: 'right',
        anchorY: 'middle',
        imageKey: 'car',
        width: 200,
        height: 200,
        src: "car",
        assets: g.assets
      })
    );

    g.ui.add(
      new Button({
        x: 0,
        y: 0,
        label: 'Click Me',
        anchorX: 'left',
        anchorY: 'middle',
        width: 200,
        height: 200,
        color: '#1e293b',
        radius: 16,
        stroke: '#475569',
        label: 'Click Me',
        font: '20px sans-serif',
        textColor: '#f8fafc',
        onClick: () => {
          this.game.scenes.switchTo('test');
          // if(g.ui.getElementByKey('show_label')){
          //   g.ui.remove('show_label');
          // }else{
          //   g.ui.add(
          //     new Label({
          //                   x: 0,
          //                   y: 0,
          //                   anchorX: 'center',
          //                   anchorY: 'top',
          //                   text: 'Button Clicked!',
          //                   key: 'show_label',
          //                 })
          //   );
          // }
        }
      })
    );
  
  }

  render(ctx) { 
    setBackgroundImage(ctx, this.game.assets, 'bg');
   }
}