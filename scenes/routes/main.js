// tempat semua route di daftarin, biar gampang di switchTo
// misal g.scenes.switchTo('menu') bakal switch ke scene menu
// semua scene harus di register dulu disini, biar bisa di switchTo
// kalau ga di register, bakal switch ke scene 404 (NotFoundScene)

function registerAllScenes(game) {
    game.first_scene = "starter";

    game.scenes.register('starter', StarterScene);
    game.scenes.register('menu', StarterScene);
    game.scenes.register('credits', CreditsScene);
    game.scenes.register('drag-drop-demo', DragDropDemoScene);
    game.scenes.register('game-over', GameOverScene);
    game.scenes.register('game', GameScene);
    game.scenes.register('result', ResultScene);
    game.scenes.register('settings', SettingsScene);
}