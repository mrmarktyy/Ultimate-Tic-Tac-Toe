/**
 * GameController
 *
 * @module      : GameController
 * @description : Contains logic for handling requests
 */
'use strict';

var sails   = require('sails');
var _       = require('lodash-node');
var UUID    = require('node-uuid');
var GameBuilder = require('../utils/gameBuilder');

/**
 *  _sockets schema:
 *
 *  {
 *      socket_id: {
 *          socket: "",
 *          uuid: ""
 *      }
 *  }
 */
var _sockets = {};
/**
 *  _games schema:
 *
 *  {
 *      uuid: {
 *          meta: {
 *              mode: "",
 *              status: ""
 *          }
 *      },
 *      creator: {
 *          socket_id: "",
 *          status: ""
 *          player: { }
 *      },
 *      joiner: {
 *          socket_id: "",
 *          status: "",
 *          player: { }
 *      }
 *  }
 *
 */
var _games   = {};

function emit (sockets, topic, message) {
    if (!_.isArray(sockets)) {
        sockets = [sockets];
    }
    _.each(sockets, function (s) {
        s.emit(topic, message);
    });
}

function notifyGameStart (uuid) {
    _.defer(function () {
        var game = _games[uuid];
        if (game) {
            var sockets = getSockets(uuid);
            game.meta.status = 'in_progress';
            emit(sockets.creator.socket, 'game:start', {role: 2, player: game.joiner.player});
            emit(sockets.joiner.socket, 'game:start', {role: 1, player: game.creator.player});
            sockets.creator.uuid = uuid;
            sockets.joiner.uuid = uuid;
        }
    });
}

function getSockets (uuid, socket_id) {
    var game = _games[uuid];
    if (uuid && game) {
        if (socket_id) {
            if (game.creator && game.creator.socket_id === socket_id) {
                return _sockets[game.joiner.socket_id];
            }
            if (game.joiner && game.joiner.socket_id === socket_id) {
                return _sockets[game.creator.socket_id];
            }
            return null;
        } else {
            return {
                creator: _sockets[game.creator.socket_id],
                joiner: _sockets[game.joiner.socket_id]
            };
        }
    }
    return _.pluck(_sockets, 'socket');
}

module.exports = {

    establish: function (session, socket) {
        if (socket) {
            _sockets[socket.id] = {
                socket: socket
            };
            emit(getSockets(), 'game:players', _.keys(_sockets).length);
            sails.util.debug('[ESTABLISH  ] socket_id: ' + socket.id + ' is connected.');
        }
    },

    disconnect: function (session, socket) {
        if (socket) {
            sails.util.debug('[DISCONNECT  ] socket_id: ' + socket.id + ' is disconnected.');
            var socket_id = socket.id,
                uuid = _sockets[socket_id].uuid,
                game = _games[uuid];
            delete _sockets[socket_id];
            if (uuid && game) {
                var _socket = getSockets(uuid, socket_id);
                // If need emit `game:leave` message to leaver's opponent
                if (_socket && _socket.socket) {
                    if (game.creator.socket_id === socket_id) {
                        game.creator.status = false;
                        emit(_socket.socket, 'game:leave', game.creator.player);
                    }
                    if (game.joiner.socket_id === socket_id) {
                        game.joiner.status = false;
                        emit(_socket.socket, 'game:leave', game.joiner.player);
                    }
                }
                if (!game.creator.status && !game.joiner.status) {
                    sails.util.debug('[DISCONNECT  ] game_id: ' + uuid + ' is closed.');
                    delete _games[uuid];
                }
            }
            emit(getSockets(), 'game:players', _.keys(_sockets).length);
        }
    },

    action: function (req, res) {
        var uuid = req.param('uuid');
        var _socket = getSockets(uuid, req.socket.id);
        if (_socket) {
            emit(
                _socket.socket,
                'game:move',
                {
                    square: req.param('square'),
                    cell: req.param('cell')
                }
            );
            return res.json({
                status: true
            });
        }
        sails.util.debug('[ACTION  ] game_id: ' + uuid + ' is invalid');
        return res.json({
            status: false,
            message: 'game_id: ' + uuid + ' is invalid.'
        });
    },

    create: function (req, res) {
        if (req.isSocket) {
            var uuid = UUID.v4(),
                player = req.param('player');
            _games[uuid] = GameBuilder.createGame({
                mode: 'private',
                socket_id: req.socket.id,
                player: GameBuilder.preparePlayer(player)
            });
            return res.json({
                status: true,
                uuid: uuid,
                nickname: player.nickname
            });
        }
    },

    join: function (req, res) {
        if (req.isSocket) {
            var uuid = req.param('uuid');
            var player = req.param('player');
            GameBuilder.preparePlayer(player);
            if (!_games[uuid] || _games[uuid].joiner) {
                sails.util.debug('[JOIN  ] game_id: ' + uuid + ' is invalid');
                return res.json({
                    status: false,
                    message: 'game_id: ' + uuid + ' is invalid'
                });
            }
            _games[uuid].joiner = GameBuilder.joinGame({
                socket_id: req.socket.id,
                player: player
            });
            notifyGameStart(uuid);
            return res.json({
                status: true,
                uuid: uuid,
                nickname: player.nickname
            });
        }
    },

    pair: function (req, res) {
        if (req.isSocket) {
            var player = req.param('player'),
                found = false,
                uuid;
            GameBuilder.preparePlayer(player);
            _.each(_games, function (game, key) {
                if (found) {
                    return false;
                }
                if (game.meta.mode !== 'private' && game.meta.status === 'waiting') {
                    player.role = 2;
                    found = true;
                    uuid = key;
                    _games[key].joiner = GameBuilder.joinGame({
                        socket_id: req.socket.id,
                        player: player
                    });
                }
            });
            if (found) {
                notifyGameStart(uuid);
            } else {
                uuid = UUID.v4();
                player.role = 1;
                _games[uuid] = GameBuilder.createGame({
                    socket_id: req.socket.id,
                    player: player
                });
            }
            return res.json({
                status: true,
                uuid: uuid,
                player: player,
                players: _.keys(_sockets).length
            });
        }
    },

    chat: function (req, res) {
        if (req.isSocket) {
            var _socket = getSockets(req.param('uuid'), req.socket.id);
            if (_socket) {
                emit(_socket.socket, 'game:chat', req.param('message'));
            }
        }
    },

    status: function (req, res) {
        return res.json({
            _sockets: _.keys(_sockets),
            _games: _games
        });
    }

};


