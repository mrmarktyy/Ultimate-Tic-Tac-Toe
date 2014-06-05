define(['vendor/lodash', 'vendor/backbone', 'vendor/jquery',
    'router', 'engine',
    'views/menu', 'views/board', 'views/status',
    'models/status', 'models/player',
    'text!templates/main.html',
    'collections/squares'],
function (_, Backbone, $, AppRouter, Engine, Menu, Board, StatusView, StatusModel, Player, MainTpl, Squares) {
    'use strict';

    function Game (options) {
        this.options = options || {};
        this.$el = $(this.options.el);
        this.$el.on('click', '.back', _.bind(this.back, this));

        return this;
    }

    _.extend(Game.prototype, {

        init: function () {
            this.router = new AppRouter(this);

            Backbone.history.start();
        },

        homeView: function () {
            this.home = new Menu.Home({
                el: this.$el
            });
        },

        singleGame: function () {
            this.single = new Menu.Single({
                el: this.$el
            });
        },

        vsHuman: function () {
            this.$el.html(MainTpl);
            var state = this.getBoardState(),
                status = new StatusModel(),
                player1 = new Player({role: 1, nickname: 'mark'}),
                player2 = new Player({role: 2, nickname: 'junjun'});

            this.initBoard(state);
            this.initEngine(status, player1, player2);
            this.initStatus(status);
        },

        vsEasy: function () {
            this.$el.html(MainTpl);
            var state = this.getBoardState(),
                status = new StatusModel(),
                player1 = new Player({role: 1, nickname: 'mark'}),
                player2 = new Player({role: 2, nickname: 'easy computer', mode: 'computer'});

            this.initBoard(state);
            this.initEngine(status, player1, player2);
            this.initStatus(status);
        },

        vsMedium: function () {
            new Menu.ComingSoon({
                el: this.$el
            });
        },

        vsHard: function () {
            new Menu.ComingSoon({
                el: this.$el
            });
        },

        back: function () {
            var routes = Backbone.history.fragment.split('/');
            routes.pop();
            this.router.navigate('#' + routes.join('/'), {trigger: true});
        },

        initBoard: function (state) {
            this.board = new Board({
                el: $('.board', this.$el),
                collection: new Squares(state),
            });
        },

        initEngine: function (status, player1, player2) {
            this.engine = Engine.getInstance({
                board: this.board,
                status: status,
                player1: player1,
                player2: player2
            }).start();

            if (/\.local/.test(location.hostname)) {
                window.Engine = this.engine;
            }
        },

        initStatus: function (status) {
            this.status = new StatusView({
                el: $('.status', this.$el),
                model: status
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
