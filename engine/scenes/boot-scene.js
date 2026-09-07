class BootScene extends Scene {
  // Boot does any one-time engine setup, then hands off immediately.
  create() { this.game.scenes.switchTo('loading'); }
}