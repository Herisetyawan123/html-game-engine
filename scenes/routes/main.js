// tempat semua route di daftarin, biar gampang di switchTo
// misal g.scenes.switchTo('menu') bakal switch ke scene menu
// semua scene harus di register dulu disini, biar bisa di switchTo
// kalau ga di register, bakal switch ke scene 404 (NotFoundScene)

function registerAllScenes(game) {
    game.first_scene = game_config.first_scene;

    game.scenes.register('starter', StarterScene);
    game.scenes.register('play', PlayScene);
    game.scenes.register('end', EndScene);
    game.scenes.register('playTwo', PlayTwoScene);
}