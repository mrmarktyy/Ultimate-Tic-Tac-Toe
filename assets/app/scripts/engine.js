define(['vendor/lodash', 'vendor/backbone', 'utils/socket'], function (_, Backbone, Socket) {
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
            /*jshint newcap:false*/
            this._instance = new this(Array.prototype.slice.call(arguments)[0]);
        }
        return this._instance;
    };

    _.extend(Engine.prototype, Backbone.Events, {

        setPlayer: function (role, player) {
            this['player' + role] = player;
            this.status.trigger('change');
            return this;
        },

        start: function () {
            // TODO initialize
            this.on('player:move', this.playerListener, this);
            this.on('show:guide', this.showGuide, this);
            this.on('hide:guide', this.hideGuide, this);
            this.listenTo(this.status, 'change:winner', this.end);

            this.status.set('role', 1);
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

        afterMove: function (response) {
            if (response) {
                this._squareIndex = response._squareIndex;
                this._cellIndex = response._cellIndex;
            }
            var cellView = this.board.getSquare(this._squareIndex).getCell(this._cellIndex);
            var cellModel = cellView.model;

            cellModel.setValue(this.currentPlayer.get('role'));
            cellView.addTada();
            this.status.update(cellModel, this._squareIndex, this._cellIndex);

            var winner = this.board.winnerScan(this._squareIndex);
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

        notifyServer: function () {
            Socket.moveAction({square: this._squareIndex, cell: this._cellIndex, uuid: this.status.get('uuid')});
        },

        /***************** Event handlers *****************/

        playerListener: function (squareIndex, cellIndex, forced) {
            if (this.status.get('owner') === 0 ||
                this.status.get('owner') === this.currentPlayer.get('role') ||
                forced === true
            ) {
                this._squareIndex = squareIndex;
                this._cellIndex = cellIndex;
                if (this.status.get('mode') === 'remote') {
                    this.notifyServer();
                }
                this.currentPlayer.get('resolver').trigger('cell:move');
            }
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
