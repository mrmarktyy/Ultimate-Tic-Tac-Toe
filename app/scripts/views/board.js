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

        setValidSquare: function (lastMove) {
            // no lastMove available
            if (_.isUndefined(lastMove)) {
                this._squares.forEach(function (squareView) {
                    squareView.$el.addClass('moveable');
                });
                return;
            }
            // square has value already or no available cell
            if (this._squares[lastMove[1]].value || !this._squares[lastMove[1]].checkAvailability()) {
                this._squares.forEach(function (squareView) {
                    if (!squareView.value) {
                        squareView.$el.addClass('moveable valid');
                    } else {
                        squareView.$el.removeClass('moveable valid');
                    }
                });
                return;
            }
            this._squares.forEach(function (squareView) {
                if (squareView._index === lastMove[1]) {
                    squareView.$el.addClass('moveable valid');
                } else {
                    squareView.$el.removeClass('moveable valid');
                }
            });
        },

        checkWin: function (squareIndex) {
            if (this._squares[squareIndex].checkWin()) {
                return Validate.checkWin(this._squares);
            }
            return 0;
        }

    });

    return Board;

});
