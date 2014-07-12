define(function () {
    'use strict';

    var _socket;

    function init (dfd) {
        var deferred = new $.Deferred();
        if (_socket) {
            return deferred.resolve();
        }
        _socket = window.io.connect();
        _socket.on('connect', function () {
            console.log('Socket is now connected.');
            deferred.resolve();
        });
        return deferred.promise();
    }

    function listenTo (topic, callback) {
        init().done(function () {
            _socket.on(topic, callback);
        });
    }

    function moveAction (action) {
        init().done(function () {
            _socket.post('/game/action', action);
        });
    }

    function createGame (player) {
        var deferred = new $.Deferred();
        init().done(function () {
            _socket.post('/game/create', {player: player, mode: 'private'}, function (response) {
                deferred.resolve(response);
            });
        });
        return deferred.promise();
    }

    function joinGame (uuid, player) {
        var deferred = new $.Deferred();
        init().done(function () {
            _socket.post('/game/join', {uuid: uuid, player: player}, function (response) {
                deferred.resolve(response);
            });
        });
        return deferred.promise();
    }

    function pairGame (player) {
        var deferred = new $.Deferred();
        init().done(function () {
            _socket.post('/game/pair', {player: player}, function (response) {
                deferred.resolve(response);
            });
        });
        return deferred.promise();
    }

    function sendMessage (uuid, message) {
        var deferred = new $.Deferred();
        init().done(function () {
            _socket.post('/game/chat', {uuid: uuid, message: message}, function (response) {
                deferred.resolve(response);
            });
        });
        return deferred.promise();
    }

    return {
        init        : init,
        listenTo    : listenTo,
        moveAction  : moveAction,
        createGame  : createGame,
        joinGame    : joinGame,
        pairGame    : pairGame,
        sendMessage : sendMessage
    };
});
