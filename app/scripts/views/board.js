define(['vendor/lodash', 'vendor/backbone', 'views/square', 'utils/validate'],
function (_, Backbone, SquareView, Validate) {
    'use strict';

    var Board = Backbone.View.extend({

        className: 'board',

        initialize: function (options) {
            this.options = options || {};
            this.$game = $(this.options.wrapper);
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
            this.$game.html(this.$el);
            return this;
        },

        getSquare: function (index) {
            return this._squares[index];
        },

        setValidSquare: function (lastMove) {
            /*jshint expr:true*/
            // no lastMove available
            if (_.isUndefined(lastMove)) {
                this._squares.forEach(function (squareView) {
                    squareView.$el.addClass('moveable');
                });
                return;
            }
            if (_.isNumber(lastMove)) {
                this._squares.forEach(function (squareView) {
                    squareView._index === lastMove ? squareView.setValid() : squareView.removeValid();
                });
                return;
            }
            // square has value already or no available cell
            if (this.getSquare(lastMove[1]).value || !this.getSquare(lastMove[1]).checkAvailability()) {
                this._squares.forEach(function (squareView) {
                    squareView.value ? squareView.removeValid(): squareView.setValid();
                });
                return;
            }
            this._squares.forEach(function (squareView) {
                squareView._index === lastMove[1] ? squareView.setValid() : squareView.removeValid();
            });
        },

        checkRole: function (squareIndex) {
            if (this.getSquare(squareIndex).checkRole()) {
                return Validate.checkRole(this._squares);
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
