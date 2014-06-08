/**
 * GameController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
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

module.exports = {

    establish: function (session, socket) {
        sockets.push(socket);
        console.log('Socket id: ' + socket.id + ' connected.\nThere\'re ' + sockets.length + ' active sockets in the poll');
    },

    disconnect: function (session, socket) {
        _.remove(sockets, function (_s) {
            return _s.id === socket.id;
        });
        console.log('Socket id: ' + socket.id + ' disconnected.\n There\'re ' + sockets.length + ' active sockets in the poll');
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


