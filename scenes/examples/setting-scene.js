class SettingsScene extends Scene {
  create() {
    const g = this.game;
    const s = g.storage.getSettings();
    g.ui.add(new Label({ x: 'center', y: 100, text: 'SETTINGS' }, null, 'SETTINGS', { align: 'center', font: 'bold 40px sans-serif' }));

    g.ui.add(new Label({ x: 'start', y: 220, text: 'Music / SFX Volume' }, null, 'Music / SFX Volume', { font: '24px sans-serif' }));
    g.ui.add(new Slider({ x: 'start', y: 250, width: 500, height: 40 }, null, 500, 40, s.volume !== undefined ? s.volume : 1, v => g.audio.setVolume(v)));

    g.ui.add(new Label({ x: 'start', y: 340, text: 'Mute' }, null, 'Mute', { font: '24px sans-serif' }));
    g.ui.add(new Toggle({ x: 'end', y: 320, width: 80, height: 40 }, null, 80, 40, g.audio.muted, v => g.audio.setMuted(v)));

    g.ui.add(new Button({ x: 'center', y: 460, width: 280, height: 64, label: 'BACK', onClick: () => { g.audio.playClick(); g.scenes.switchTo('menu'); } }));
  }
  render(ctx) { drawBackdrop(ctx, this.game.assets); }
}
