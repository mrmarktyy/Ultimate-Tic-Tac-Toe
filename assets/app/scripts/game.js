define(['vendor/lodash', 'vendor/backbone', 'vendor/jquery',
    'router', 'engine',
    'views/menu', 'views/board', 'views/status',
    'models/status', 'models/player',
    'utils/socket',
    'text!templates/layout.html',
    'collections/squares'],
function (_, Backbone, $, AppRouter, Engine, Menu, Board, StatusView, StatusModel, Player, Socket, LayoutTpl, Squares) {
    'use strict';

    function Game (options) {
        this.options = options || {};
        this.$el = $(this.options.el);
        this.$el.on('click', '.back', _.bind(this.back, this));

        return this;
    }

    _.extend(Game.prototype, {

        /***************** Initialize *****************/

        init: function () {
            this.router = new AppRouter(this);

            Backbone.history.start();
            return this;
        },

        establishSocket: function () {
            var deferred = new $.Deferred();
            Socket.init(deferred);
            return deferred.promise();
        },

        /***************** Menu routers *****************/

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

        online: function () {
            this.single = new Menu.Online({
                el: this.$el
            });
        },

        soon: function () {
            new Menu.ComingSoon({
                el: this.$el
            });
        },

        vsHuman: function () {
            this.startGame(
                new StatusModel(),
                this.getInitalState(),
                new Player({role: 1, nickname: 'mark'}),
                new Player({role: 2, nickname: 'junjun'})
            );
        },

        vsEasy: function () {
            this.startGame(
                new StatusModel({owner: 1}),
                this.getInitalState(),
                new Player({role: 1, nickname: 'mark'}),
                new Player({role: 2, nickname: 'easy computer', mode: 'computer'})
            );
        },

        player1: function () {
            this.establishSocket().done(_.bind(function () {
                var player1 = {role: 1, nickname: 'mark', type: 'local'},
                    player2 = {role: 2, nickname: 'junjun', type: 'remote'};
                // var player2 = this.requestInfo();
                this.startGame(
                    new StatusModel({owner: 1, mode: 'remote'}),
                    this.getInitalState(),
                    new Player(player1),
                    new Player(player2)
                );
            }, this));
        },

        player2: function () {
            this.establishSocket().done(_.bind(function () {
                var player1 = {role: 1, nickname: 'mark', type: 'remote'},
                    player2 = {role: 2, nickname: 'junjun', type: 'local'};
                // var player2 = this.requestInfo();
                this.startGame(
                    new StatusModel({owner: 2, mode: 'remote'}),
                    this.getInitalState(),
                    new Player(player1),
                    new Player(player2)
                );
            }, this));
        },

        createGame: function () {
            this.establishSocket().done(function () {
                Socket.createGame().done(function (response) {
                    console.log(response);
                });
            });
        },

        startGame: function (status, state, player1, player2) {
            this.$el.html(LayoutTpl);
            this.initBoard(state);
            this.initEngine(status, player1, player2);
            this.initStatus(status);
        },

        requestInfo: function () {
            // TODO make request for asking game info
            var player1 = {role: 1, nickname: 'mark', type: 'local'},
                player2 = {role: 2, nickname: 'junjun', type: 'remote'};
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

            if (/\.local|localhost/.test(location.hostname)) {
                window.Engine = this.engine;
            }
        },

        initStatus: function (status) {
            this.status = new StatusView({
                el: $('.status', this.$el),
                model: status
            });
        },

        /***************** Event handlers *****************/

        back: function () {
            var routes = Backbone.history.fragment.split('/');
            routes.pop();
            this.router.navigate('#' + routes.join('/'), {trigger: true});
        },

        /***************** Miscellaneous methods *****************/

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
