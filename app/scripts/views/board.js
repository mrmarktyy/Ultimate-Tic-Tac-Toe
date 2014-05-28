define(['vendor/lodash', 'vendor/backbone', 'views/square'], function (_, Backbone, SquareView) {

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
            this.collection.each(function (Square) {
                var squareView = new SquareView({
                    collection: Square
                });
                this.$el.append(squareView.render().$el);
                this._squares.push(squareView);
            }, this);
            this.$game.append(this.$el);
            return this;
        }

    });

    return Board;

});
