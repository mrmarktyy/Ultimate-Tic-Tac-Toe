define(['vendor/lodash', 'vendor/backbone'], function (_, Backbone) {
    'use strict';

    function Engine (options) {
        this.options = options || {};
        this.board = this.options.board;
        this.status = this.options.status;
        this.player1 = this.options.player1;
        this.player2 = this.options.player2;
        this._squareIndex = undefined;
        this._cellIndex = undefined;

        return this;
    }

    Engine.getInstance = function () {
        if (_.isUndefined(this._instance)) {
            return this._instance = new this(Array.prototype.slice.call(arguments)[0]);
        }
        return this._instance;
    };

    _.extend(Engine.prototype, Backbone.Events, {

        start: function () {
            // TODO initialize
            this.on('cell:move', this.moveListener, this);

            this.nextMove();
        },

        nextMove: function () {
            var lastMove = this.status.getLastMove();
            this.board.setValidSquare(lastMove);

            var role = this.status.get('role');

            this.currentPlayer = this.getPlayer(role);
            this.currentPlayer.get('resolver').getNextMove().done(_.bind(this.afterMove, this));
                // cellModel

                // self.afterMove();
            // });
        },

        afterMove: function (cellModel) {
            this.status.finishRound(cellModel, this._squareIndex, this._cellIndex);
            this.nextMove();
        },

        moveListener: function (cellModel, squareIndex, cellIndex) {
            this._squareIndex = squareIndex;
            this._cellIndex = cellIndex;
            this.currentPlayer.get('resolver').trigger('cell:move', cellModel);
        },

        getPlayer: function (role) {
            if (role === 1) {
                return this.player1;
            }
            if (role === 2) {
                return this.player2;
            }
            return undefined;
        }

    });

    return Engine;
});
