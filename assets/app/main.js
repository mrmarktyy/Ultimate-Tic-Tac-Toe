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

    var options = {
        el: '#ultimate',
        data: []
    };

    var game = new Game(options);
    game.init();
});
