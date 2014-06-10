/**
 * GameController
 *
 * @module      :: Controller
 * @description :: Contains logic for handling requests.
 */
'use strict';
var _       = require('lodash-node');
var utils   = require('../utils');
var sockets = [];

function boardcast (socket, action) {
    sockets.forEach(function (_s) {
        if (_s.id !== socket.id) {
            _s.emit('move', action);
        }
    });
}

module.exports = {

    establish: function (session, socket) {
        if (socket) {
            sockets.push(socket);
            sails.log.info('Socket: ' + socket.id + ' connected.');
            sails.log.info('There\'re ' + sockets.length + ' active connections in the poll.');
        }
    },

    disconnect: function (session, socket) {
        if (socket) {
            _.remove(sockets, function (_s) {
                return _s.id === socket.id;
            });
            sails.log.info('Socket: ' + socket.id + ' disconnect.');
            sails.log.info('There\'re ' + sockets.length + ' active connections in the poll.');
        }
    },

    createGame: function () {
        var uuid = utils.uuid();
        sails.log.info(uuid);
        return uuid;
    },

    findPlayer: function () {

    },

    action: function (req, res) {
        var action = {
            square: req.param('square'),
            cell: req.param('cell')
        };

        boardcast(req.socket, action);

        res.json({status: true});
    }

};


