class MainMenuScene extends Scene {
  create() {
    const g = this.game;
    g.ui.add(new Label(BASE_WIDTH / 2, 150, 'OFFLINE GAME FRAMEWORK', { align: 'center', font: 'bold 46px sans-serif', color: '#1228b3' }));
    g.ui.add(new Label(BASE_WIDTH / 2, 200, 'Demo: shape matching mini-game', { align: 'center', font: '22px sans-serif', color: '#93c5fd' }));

    g.ui.add(new Button(BASE_WIDTH / 2 - 140, 280, 280, 64, 'PLAY', () => { g.audio.playClick(); g.scenes.switchTo('game'); }));
    g.ui.add(new Button(BASE_WIDTH / 2 - 140, 360, 280, 64, 'SETTINGS', () => { g.audio.playClick(); g.scenes.switchTo('settings'); }, { color: '#6366f1', hoverColor: '#4f46e5' }));
    g.ui.add(new Button(BASE_WIDTH / 2 - 140, 440, 280, 64, 'CREDITS', () => { g.audio.playClick(); g.scenes.switchTo('credits'); }, { color: '#6b7280', hoverColor: '#4b5563' }));

    g.ui.add(new Label(BASE_WIDTH / 2, 540, 'Best Score: ' + g.storage.getHighScore(), { align: 'center', font: '24px sans-serif' }));
  }
  render(ctx) { 
    setBackgroundImage(ctx, this.game.assets, 'ui/bg');
   }
}