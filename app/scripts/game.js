define(['vendor/lodash', 'vendor/backbone', 'router', 'engine', 'views/home', 'views/board', 'models/status', 'models/player', 'collections/squares'],
function (_, Backbone, AppRouter, Engine, HomeView, Board, Status, Player, Squares) {
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

            this.engine = Engine.getInstance({
                board: this.board,
                status: new Status(),
                player1: new Player({role: 1, nickname: 'mark'}),
                player2: new Player({role: 2, nickname: 'junjun'})
            }).start();

            if (/\.local/.test(location.hostname)) {
                window.Engine = this.engine;
            }
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
