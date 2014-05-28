define(['vendor/backbone', 'views/board', 'collections/squares'], function (Backbone, Board, Squares) {
    'use strict';

    function Game (options) {
        this.options = options || {};

        return this;
    }

    _.extend(Game.prototype, {

        init: function () {

            var state = this.getBoardState();

            this.board = new Board({
                wrapper: this.options.el,
                collection: new Squares(state)
            });

        },

        getBoardState: function () {
            if (!_.isEmpty(this.options.data)) {
                return this.options.data;
            }
            return this.getInitalState();
        },

        getInitalState: function () {
            var data = [];
            for (var i = 0; i < 9; i++) {
                data.push([{},{},{},{},{},{},{},{},{}]);
            }
            return data;
        }

    }, Backbone.Events);

    return Game;
});
