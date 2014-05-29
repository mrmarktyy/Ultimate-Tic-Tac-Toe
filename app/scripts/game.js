define(['vendor/backbone', 'router', 'views/home', 'views/board', 'collections/squares'],
function (Backbone, AppRouter, HomeView, Board, Squares) {
    'use strict';

    function Game (options) {
        this.options = options || {};

        return this;
    }

    _.extend(Game.prototype, {

        init: function () {

            var appRouter = new AppRouter(this);
            this.on('navigate:single', this.singleGame);
            this.on('navigate:home', this.homeView);

            Backbone.history.start();
        },

        homeView: function () {
            this.home = new HomeView({
                el: this.options.el
            });
        },

        singleGame: function () {
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
