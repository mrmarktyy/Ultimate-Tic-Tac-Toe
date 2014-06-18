define(['vendor/lodash', 'vendor/backbone', 'views/square', 'utils/helper'],
function (_, Backbone, SquareView, Helper) {
    'use strict';

    var Board = Backbone.View.extend({

        initialize: function (options) {
            this.options = options || {};
            this._squares = [];
            this.render();
            return this;
        },

        render: function () {
            this.collection.each(function (Square, index) {
                var squareView = new SquareView({
                    collection: Square,
                    _index: index,
                    _board: this
                });
                this.$el.append(squareView.render().$el);
                this._squares.push(squareView);
            }, this);
            return this;
        },

        getSquare: function (index) {
            return this._squares[index];
        },

        getState: function () {
            return this.collection.toJSON();
        },

        clearTada: function () {
            this.$el.find('.tada').removeClass('tada');
            return this;
        },

        HelperSquares: function (lastMove) {
            /*jshint expr:true*/
            // no lastMove available
            var validSquares = [];
            if (_.isUndefined(lastMove)) {
                this._squares.forEach(function (squareView, index) {
                    squareView.$el.addClass('moveable');
                    validSquares.push(index);
                });
                return validSquares;
            }
            if (_.isNumber(lastMove)) {
                this._squares.forEach(function (squareView) {
                    squareView._index === lastMove ? squareView.setValid() : squareView.removeValid();
                });
                return [lastMove];
            }
            // square has value already or no available cell
            if (this.getSquare(lastMove[1]).value || !this.getSquare(lastMove[1]).checkAvailability()) {
                this._squares.forEach(function (squareView, index) {
                    if (squareView.value) {
                        squareView.removeValid();
                    } else {
                        squareView.setValid();
                        validSquares.push(index);
                    }
                });
                return validSquares;
            }
            this._squares.forEach(function (squareView) {
                squareView._index === lastMove[1] ? squareView.setValid() : squareView.removeValid();
            });
            return [lastMove[1]];
        },

        winnerScan: function (squareIndex) {
            if (this.getSquare(squareIndex).checkRole()) {
                return Helper.checkRole(this._squares);
            }
            return 0;
        },

        undoLastmove: function (lastMove) {
            this.getSquare(lastMove[0]).getCell(lastMove[1]).model.setValue(0);
            this.checkRole(lastMove[0]);
        }

    });

    return Board;

});
