define(['vendor/lodash', 'vendor/backbone', 'vendor/jquery',
    'router', 'engine',
    'views/menu', 'views/board', 'views/status',
    'models/status', 'models/player',
    'utils/socket', 'utils/validate',
    'text!templates/layout.html',
    'collections/squares'],
function (_, Backbone, $, AppRouter, Engine, Menu, Board, StatusView, StatusModel, Player, Socket, Validate, LayoutTpl, Squares) {
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

        createGame: function () {
            this.player = {role: 1, nickname: 'mark'};
            Socket.createGame(this.player).done(_.bind(function (response) {
                this.uuid = response;
                // TODO update status
                Socket.listenTo('game:start', _.bind(this.prepareGame, this));
            }, this));
        },

        joinGame: function (queryString) {
            this.player = {role: 2, nickname: 'junjun'};
            this.uuid = Validate.getQueryParams(queryString).id;
            if (this.uuid) {
                Socket.listenTo('game:start', _.bind(this.prepareGame, this));
                Socket.joinGame(this.uuid, this.player).done(_.bind(function (response) {
                    // TODO update status
                }, this));
            }
        },

        prepareGame: function (response) {
            this.player = _.merge(this.player, {mode: 'human', type: 'local'});
            var player = _.merge(response, {mode: 'human', type: 'remote'});

            var status = new StatusModel({uuid: this.uuid, owner: this.player.role, mode: 'remote'}),
                player1, player2;
            if (this.player.role === 1) {
                player1 = new Player(this.player);
                player2 = new Player(player);
            } else {
                player1 = new Player(player);
                player2 = new Player(this.player);
            }
            this.startGame(
                status,
                this.getInitalState(),
                player1,
                player2
            );
        },

        startGame: function (status, state, player1, player2) {
            this.$el.html(LayoutTpl);
            this.initBoard(state);
            this.initEngine(status, player1, player2);
            this.initStatus(status);
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
