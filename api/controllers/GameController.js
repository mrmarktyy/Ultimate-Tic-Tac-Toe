/**
 * GameController
 *
 * @module      :: Controller
 * @description :: Contains logic for handling requests.
 */
'use strict';

var _       = require('lodash-node');
var utils   = require('../utils');
var sails   = require('sails');
var _sockets = {};
var _games   = {};

function notifyGameAction (uuid, socket_id, action) {
    if (_games[uuid]) {
        // Check which socket to send action
        if (_games[uuid].creator.socket_id === socket_id) {
            _sockets[_games[uuid].joiner.socket_id].socket.emit('game:move', action);
        } else {
            _sockets[_games[uuid].creator.socket_id].socket.emit('game:move', action);
        }
    }
}

function notifyGameStart (uuid) {
    if (_games[uuid]) {
        _games[uuid].meta.status = 'in_progress';
        _sockets[_games[uuid].creator.socket_id].socket.emit('game:start', {role: 2, player: _games[uuid].joiner.player});
        _sockets[_games[uuid].creator.socket_id].uuid = uuid;
        _sockets[_games[uuid].joiner.socket_id].socket.emit('game:start', {role: 1, player: _games[uuid].creator.player});
        _sockets[_games[uuid].joiner.socket_id].uuid = uuid;
    }
}

module.exports = {

    establish: function (session, socket) {
        if (socket) {
            _sockets[socket.id] = {
                socket: socket
            };
            sails.util.debug('[ESTABLISH  ] socket_id: ' + socket.id + ' is connected.');
        }
    },

    disconnect: function (session, socket) {
        if (socket) {
            var uuid = _sockets[socket.id].uuid;
            sails.util.debug('[DISCONNECT  ] socket_id: ' + socket.id + ' is disconnected.');
            delete _sockets[socket.id];
            if (uuid && _games[uuid]) {
                if (_games[uuid].creator.socket_id === socket.id) {
                    _games[uuid].creator.status = 'inactive';
                }
                if (_games[uuid].joiner.socket_id === socket.id) {
                    _games[uuid].joiner.status = 'inactive';
                }
                if (_games[uuid].creator.status === 'inactive' && _games[uuid].joiner.status === 'inactive') {
                    sails.util.debug('[DISCONNECT  ] game_id: ' + uuid + ' is closed.');
                    delete _games[uuid];
                }
            }
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
            sails.util.debug('[ACTION  ] game_id: ' + uuid + ' is invalid');
            return res.json({
                status: false,
                message: 'game_id: ' + uuid + ' is invalid.'
            });
        }
    },

    create: function (req, res) {
        if (req.isSocket) {
            var uuid = utils.uuid();
            var player = req.param('player');
            if (!player.nickname) {
                player.nickname = _.uniqueId('Guest_');
            }
            _games[uuid] = {
                meta: {
                    mode: req.param('mode'),
                    status: 'waiting'
                },
                creator: {
                    socket_id: req.socket.id,
                    status: 'active',
                    player: player
                }
            };
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
            if (!_games[uuid] || _games[uuid].joiner) {
                sails.util.debug('[JOIN  ] game_id: ' + uuid + ' is invalid');
                return res.json({
                    status: false,
                    message: 'game_id: ' + uuid + ' is invalid'
                });
            }
            if (!player.nickname) {
                player.nickname = _.uniqueId('Guest_');
            }
            _games[uuid].joiner = {
                socket_id: req.socket.id,
                status: 'active',
                player: player
            };
            _.defer(function () {
                notifyGameStart(uuid);
            });
            return res.json({
                status: true,
                nickname: player.nickname
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


