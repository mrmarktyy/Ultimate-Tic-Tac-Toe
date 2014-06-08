define(['vendor/lodash', 'vendor/backbone'], function (_, Backbone) {
    'use strict';

    function Resolver(player) {
        this.player = player;
        this.init();
    }

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
            _.defer(_.bind(this.computeMove, this), lastMove, validSquares);
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
         * To be overriden by child instance. Operations/Computations on
         * figuring out valid move
         *
         * @return Fire Engine cell:move event with a valid cellModel
         */
        computeMove: function () {}

    });

    Resolver.extend = Backbone.Model.extend;

    return Resolver;
});
