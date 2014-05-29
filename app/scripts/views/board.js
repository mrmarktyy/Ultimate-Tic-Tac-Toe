define(['vendor/lodash', 'vendor/backbone', 'views/square', 'models/status', 'models/player'],
function (_, Backbone, SquareView, Status, Player) {
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
            this.status = new Status();
            this.player1 = new Player({_id: 1, nickname: 'mark'});
            this.player2 = new Player({_id: 2, nickname: 'junjun'});

        }

    });

    return Board;

});
