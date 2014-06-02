define(['vendor/lodash', 'vendor/backbone', 'vendor/jquery', 'router', 'engine', 'views/home', 'views/board', 'views/status', 'models/status', 'models/player', 'collections/squares'],
function (_, Backbone, $, AppRouter, Engine, HomeView, Board, StatusView, StatusModel, Player, Squares) {
    'use strict';

    function Game (options) {
        this.options = options || {};
        this.$el = $(this.options.el);

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
                el: this.$el
            });
        },

        singleGame: function () {
            var state = this.getBoardState(),
                status = new StatusModel(),
                player1 = new Player({role: 1, nickname: 'mark'}),
                player2 = new Player({role: 2, nickname: 'junjun'});

            this.board = new Board({
                el: $('.board', this.$el),
                collection: new Squares(state),
            });

            this.engine = Engine.getInstance({
                board: this.board,
                status: status,
                player1: player1,
                player2: player2
            }).start();

            this.status = new StatusView({
                el: $('.status', this.$el),
                model: status
            });

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
