define(['vendor/lodash', 'vendor/backbone'], function (_, Backbone) {
    'use strict';

    function Resolver(player) {
        this.player = player;
    }

    _.extend(Resolver.prototype, Backbone.Events, {

        /**
         * @return promise
         */
        getNextMove: function (lastMove, validSquares) {
            this.deferred = new $.Deferred();
            this.once('cell:move', this.cellMoveListener, this);
            // TODO FIX: every getNextMove will add a listener
            this.on('cell:reject', this.rejectMoveListener, this);
            this.computeMove(lastMove, validSquares);
            return this.deferred.promise();
        },

        /**
         * Triggered by Engine when receives a cell:move event
         */
        cellMoveListener: function (cellModel) {
            cellModel.setValue(this.player.get('role'));
            this.deferred.resolve(cellModel);
        },

        /**
         * Triggered by Engine when decides to abort awaiting move
         */
        rejectMoveListener: function () {
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
