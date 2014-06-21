'use strict';

var _ = require('lodash-node');

var GameBuilder = {
    /**
     * Fake UUID generator
     */
    generateUUID: function () {
        var s4 = function () {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        };
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    },

    /**
     * Prepare player json
     */
    preparePlayer: function (player) {
        if (!player.nickname) {
            player.nickname = _.uniqueId('Guest_');
        }
        return player;
    },

    /**
     * Options:
     * @mode: public | private
     * @socket_id: creator socket_id
     * @player: creator json
     */
    createGame: function (options) {
        return {
            meta: {
                mode: options.mode || 'public',
                status: 'waiting'
            },
            creator: {
                socket_id: options.socket_id,
                status: 'active',
                player: options.player
            }
        };
    },

    /**
     * Options:
     * @mode: public | private
     * @socket_id: creator socket_id
     * @player: creator json
     */
    joinGame: function (options) {
        return {
            socket_id: options.socket_id,
            status: 'active',
            player: options.player
        };
    }


};

module.exports = GameBuilder;
