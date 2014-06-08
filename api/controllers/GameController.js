/**
 * GameController
 *
 * @module      :: Controller
 * @description :: Contains logic for handling requests.
 */
'use strict';
var _ = require('lodash-node');
var sockets = [];

function boardcast (socket, action) {
    sockets.forEach(function (_s) {
        if (_s.id !== socket.id) {
            _s.emit('move', action);
        }
    });
}

function log (id, state) {
    sails.log.info('Socket: ' + id + ' ' + state + 'ed.');
    sails.log.info('There\'re ' + sockets.length + ' active connections in the poll');
}

module.exports = {

    establish: function (session, socket) {
        sockets.push(socket);
        log(socket.id, 'connect');
    },

    disconnect: function (session, socket) {
        _.remove(sockets, function (_s) {
            return _s.id === socket.id;
        });
        log(socket.id, 'disconnect');
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


