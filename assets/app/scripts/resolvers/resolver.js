define(['vendor/lodash', 'vendor/backbone'],
function (_, Backbone) {
    'use strict';

    function Resolver(player) {
        this.player = player;
        this.init();
    }

    Resolver.extend = Backbone.Model.extend;

    _.extend(Resolver.prototype, Backbone.Events, {
        /**
         * Initialize
         */
        init: function () {
            this.on('cell:reject', this.rejectListener, this);
        },

        /**
         * @return promise
         */
        getNextMove: function (lastMove, validSquares) {
            this.deferred = new $.Deferred();
            this.once('cell:move', this.moveListener, this);
            return this.deferred.promise();
        },

        /**
         * Triggered by Engine when receives a player:move event
         */
        moveListener: function () {
            this.deferred.resolve();
        },

        /**
         * Triggered by Engine when decides to abort awaiting move
         */
        rejectListener: function () {
            this.deferred.reject();
        },

        /**
         * To be overriden by child instance. Computations on
         * finding out a valid move
         *
         * @return Fire Engine player:move event with valid
         *         _squareIndex and _cellIndex
         */
        computeMove: function () {}

    });

    return Resolver;
});
