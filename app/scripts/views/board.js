define(['vendor/lodash', 'vendor/backbone', 'engine', 'views/square', 'models/status', 'models/player'],
function (_, Backbone, SquareView, Engine, Status, Player) {
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
            this.collection.each(function (Square) {
                var squareView = new SquareView({
                    collection: Square
                });
                this.$el.append(squareView.render().$el);
                this._squares.push(squareView);
            }, this);
            this.$game.html(this.$el);
            return this;
        },

        start: function () {
            this.engine = new Engine({
                state: this.collection,
                status: new Status(),
                player1: new Player({_id: 1, nickname: 'mark'}),
                player2: new Player({_id: 2, nickname: 'junjun'})
            });
        }

    });

    return Board;

});
