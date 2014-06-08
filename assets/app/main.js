require.config({
    'baseUrl': 'app/scripts/',
    'paths': {
        'vendor': '../vendor',
        'text': '../vendor/text'
    },
    'waitSeconds': 30,
    'urlArgs': 'bust=' + (new Date()).getTime()
});
define('main', ['game'], function (Game) {
    'use strict';

    var options = {
        el: '#ultimate',
        data: []
    };

    var _socket = window.io.connect();

    _socket.on('connect', function socketConnected () {

        console.log('Socket is now connected.');

        window._socket = _socket;

        var game = new Game(options);
        game.init();
    });

});
