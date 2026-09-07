class DragDropDemoScene extends Scene {
  create() {
    const g = this.game;

    const dropArea = new DropArea({
      x: 'center',
      y: 180,
      width: 480,
      height: 260,
      label: 'DROP HERE',
      assets: g.assets,
      imageKey: 'homepage/background',
      stroke: '#fbbf24',
      accepts: item => item.id === 'apple'
    });
    g.ui.add(dropArea);

    const dragItem = new DragArea({
      x: 140,
      y: 500,
      width: 140,
      height: 140,
      assets: g.assets,
      imageKey: 'homepage/year_1',
      label: 'APPLE',
      id: 'apple',
      dropAreas: [dropArea]
    });
    dragItem.id = 'apple';
    dragItem.key = 'apple';
    g.ui.add(dragItem);

    const hint = new Label({ x: 'center', y: 60, text: 'Drag the item into the drop zone' }, null, 'Drag the item into the drop zone', { align: 'center', font: 'bold 28px sans-serif', color: '#f8fafc' });
    g.ui.add(hint);
  }

  render(ctx) {
    setBackgroundImage(ctx, this.game.assets, 'homepage/background');
  }
}
