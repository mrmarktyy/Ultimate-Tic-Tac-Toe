/**
 * GameController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

'use strict';
var _ = require('lodash-node');
var sockets = [];

function boardcast (sender, action) {
    sockets.forEach(function (socket) {
        if (sender.id !== socket.id) {
            socket.emit('move', action);
        }
    });
}

module.exports = {

    establish: function (req, res) {
        sockets.push(req.socket);
        console.log('Socket id: ' + req.socket.id + ' connected.\nThere\'re ' + sockets.length + ' active sockets in the poll');
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


