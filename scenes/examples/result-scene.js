
class ResultScene extends Scene {
  create(data) {
    const g = this.game;
    const d = data || { score: 0, time: 0 };
    g.ui.add(new Label({ x: 'center', y: 180, text: 'LEVEL COMPLETE!' }, null, 'LEVEL COMPLETE!', { align: 'center', font: 'bold 44px sans-serif', color: '#facc15' }));
    g.ui.add(new Label({ x: 'center', y: 260, text: 'Score: ' + d.score }, null, 'Score: ' + d.score, { align: 'center', font: '30px sans-serif' }));
    g.ui.add(new Label({ x: 'center', y: 300, text: 'Time: ' + d.time + 's' }, null, 'Time: ' + d.time + 's', { align: 'center', font: '30px sans-serif' }));
    g.ui.add(new Button({ x: 'center', y: 380, width: 280, height: 64, label: 'PLAY AGAIN', onClick: () => { g.audio.playClick(); g.scenes.switchTo('game'); } }));
    g.ui.add(new Button({ x: 'center', y: 460, width: 280, height: 64, label: 'MAIN MENU', onClick: () => { g.audio.playClick(); g.scenes.switchTo('menu'); } }, null, null, null, 'MAIN MENU', () => { g.audio.playClick(); g.scenes.switchTo('menu'); }, { color: '#6b7280', hoverColor: '#4b5563' }));
  }
  render(ctx) { drawBackdrop(ctx, this.game.assets); }
}
