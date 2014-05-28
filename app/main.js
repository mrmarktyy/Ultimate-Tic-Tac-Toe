var requireConfig = {
    'baseUrl': 'app/scripts/',
    'paths': {
        'vendor': '../vendor',
        'text': '../vendor/text'
    },
    'urlArgs': 'bust=' + (new Date()).getTime()
};

require.config(requireConfig);
require(['game'], function (Game) {
    'use strict';

    var options = {
        el: '#ultimate',
        mode: 'new',
        data: []
    };

    var game = new Game(options);
    game.init();

});
