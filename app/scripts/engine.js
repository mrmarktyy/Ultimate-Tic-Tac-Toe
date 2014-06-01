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

            this.on('player:move', this.playerListener, this);
            this.on('show:guide', this.showGuide, this);
            this.on('hide:guide', this.hideGuide, this);
            this.listenTo(this.status, 'change:winner', this.end);

            this.nextMove();

            // TODO create facade
            return this;
        },

        nextMove: function () {
            var lastMove = this.status.getLastMove();
            var validSquares = this.board.validateSquares(lastMove);

            var role = this.status.get('role');

            this.currentPlayer = this.getPlayer(role);
            this.currentPlayer.get('resolver')
                .getNextMove(lastMove, validSquares)
                .done(_.bind(this.afterMove, this))
                .fail(_.bind(this.rejectMove, this));
        },

        afterMove: function (cellModel) {
            this.status.execMove(cellModel, this._squareIndex, this._cellIndex);
            this.board.clearLastMove().getSquare(this._squareIndex).getCell(this._cellIndex).setLastMove();
            var winner = this.board.checkRole(this._squareIndex);
            if (winner) {
                this.status.set('winner', winner);
            } else {
                this.nextMove();
            }
        },

        rejectMove: function () {
            // TODO reject
        },

        undoMove: function () {
            this.board.undoLastmove(this.status.undoMove());
            this.currentPlayer.get('resolver').trigger('cell:reject');
            this.nextMove();
        },

        /***************** Event handlers *****************/

        playerListener: function (cellModel, squareIndex, cellIndex) {
            this._squareIndex = squareIndex;
            this._cellIndex = cellIndex;
            this.currentPlayer.get('resolver').trigger('cell:move', cellModel);
        },

        showGuide: function (cellIndex) {
            this.board.getSquare(cellIndex).showGuide();
        },

        hideGuide: function (cellIndex) {
            this.board.getSquare(cellIndex).hideGuide();
        },

        end: function () {
            alert('Game End. Winner is: ' + this.getPlayer(this.status.get('winner')).get('nickname'));
        },

        /***************** Miscellaneous methods *****************/

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
