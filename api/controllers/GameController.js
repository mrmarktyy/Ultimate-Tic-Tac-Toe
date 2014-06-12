/**
 * GameController
 *
 * @module      :: Controller
 * @description :: Contains logic for handling requests.
 */
'use strict';
var _       = require('lodash-node');
var utils   = require('../utils');
var _sockets = {};
var _games   = {};

function boardcast (uuid, socket_id, action) {
    if (_games[uuid]) {
        // TODO cleanup, a bit nasty now
        // Check which socket to send action
        if (_games[uuid].creator.socket_id === socket_id) {
            _sockets[_games[uuid].joiner.socket_id].emit('game:move', action);
        } else {
            _sockets[_games[uuid].creator.socket_id].emit('game:move', action);
        }
    }
}

function notifyGameStart (uuid) {
    if (_games[uuid]) {
        _sockets[_games[uuid].creator.socket_id].emit('game:start', _games[uuid].joiner.player);
        _sockets[_games[uuid].joiner.socket_id].emit('game:start', _games[uuid].creator.player);
    }
}

module.exports = {

    establish: function (session, socket) {
        if (socket) {
            _sockets[socket.id] = socket;
        }
    },

    disconnect: function (session, socket) {
        if (socket) {
            delete _sockets[socket.id];
        }
    },

    create: function (req, res) {
        if (req.isSocket) {
            var uuid = utils.uuid();
            _games[uuid] = {
                creator: {
                    socket_id: req.socket.id,
                    player: req.param('player')
                }
            };
            return res.json({
                status: true,
                uuid: uuid
            });
        }
    },

    join: function (req, res) {
        if (req.isSocket) {
            var uuid = req.param('uuid');
            if (!_games[uuid]) {
                return res.json({
                    status: false,
                    message: 'Game with game_id: ' + uuid + ' does not exist.'
                });
            }
            if (_games[uuid].joiner) {
                return res.json({
                    status: false,
                    message: 'Game with game_id: ' + uuid + ' has already started.'
                });
            }
            _games[uuid].joiner = {
                socket_id: req.socket.id,
                player: req.param('player')
            };
            notifyGameStart(uuid);
            return res.json({
                status: true
            });
        }
    },

    find: function (req, res) {

    },

    status: function (req, res) {
        return res.json({
            _sockets: _.keys(_sockets),
            _games: _games
        });
    },

    action: function (req, res) {
        var uuid = req.param('uuid');
        if (uuid && _games[uuid]) {
            var action = {
                square: req.param('square'),
                cell: req.param('cell')
            };

            boardcast(uuid, req.socket.id, action);
        } else {
            return res.json({
                status: false,
                message: 'game_id: ' + uuid + ' is invalid.'
            });
        }
    }

};


