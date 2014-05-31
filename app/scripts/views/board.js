define(['vendor/lodash', 'vendor/backbone', 'views/square'],
function (_, Backbone, SquareView) {
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
                    _index: index
                });
                this.$el.append(squareView.render().$el);
                this._squares.push(squareView);
            }, this);
            this.$game.html(this.$el);
            return this;
        },

        setValidSquare: function (lastMove) {
            if (_.isUndefined(lastMove)) {
                this._squares.forEach(function (squareView) {
                    squareView.$el.addClass('moveable');
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
        }

    });

    return Board;

});
