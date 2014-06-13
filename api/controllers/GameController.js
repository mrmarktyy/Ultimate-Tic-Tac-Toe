/**
 * GameController
 *
 * @module      :: Controller
 * @description :: Contains logic for handling requests.
 */
'use strict';

var _       = require('lodash-node');
var utils   = require('../utils');
var Logger   = require('../utils/log');
var _sockets = {};
var _games   = {};

function notifyGameAction (uuid, socket_id, action) {
    if (_games[uuid]) {
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
        _games[uuid].meta.status = 'in_progress';
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

    action: function (req, res) {
        var uuid = req.param('uuid');
        if (uuid && _games[uuid]) {
            var action = {
                square: req.param('square'),
                cell: req.param('cell')
            };

            notifyGameAction(uuid, req.socket.id, action);
        } else {
            Logger.debug('[ACTION  ] game_id: ' + uuid + ' is invalid');
            return res.json({
                status: false,
                message: 'game_id: ' + uuid + ' is invalid.'
            });
        }
    },

    create: function (req, res) {
        if (req.isSocket) {
            var uuid = utils.uuid();
            _games[uuid] = {
                meta: {
                    mode: req.param('mode'),
                    status: 'waiting'
                },
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
            if (!_games[uuid] || _games[uuid].joiner) {
                Logger.debug('[JOIN  ] game_id: ' + uuid + ' is invalid');
                return res.json({
                    status: false,
                    message: 'game_id: ' + uuid + ' is invalid'
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
    }

};


