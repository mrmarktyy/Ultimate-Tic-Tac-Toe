require.config({
    'baseUrl': 'app/scripts/',
    'paths': {
        'vendor': '../vendor',
        'text': '../vendor/text'
    },
    'urlArgs': 'bust=' + (new Date()).getTime()
});
define('main', ['game'], function (Game) {
    'use strict';

    var game = new Game({ el: '#ultimate' });
    game.init();
});
