define(['vendor/lodash', 'vendor/backbone', 'vendor/jquery',
    'router', 'engine',
    'views/board', 'views/status', 'views/game/wait',
    'models/status', 'models/player',
    'utils/socket', 'utils/validate',
    'text!templates/layout.html',
    'collections/squares'],
function (_, Backbone, $, AppRouter, Engine, Board, StatusView, Wait, StatusModel, Player, Socket, Validate, LayoutTpl, Squares) {
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
                new Player({role: 2, nickname: 'Easy Computer', mode: 'computer'})
            );
        },

        createFriendGame: function () {
            this.player = {role: 1, nickname: 'mark'};
            var model = new Backbone.Model();
            new Wait({
                el: this.$el,
                model: model
            });
            Socket.listenTo('game:start', _.bind(this.prepareGame, this));
            Socket.createGame(this.player).done(_.bind(function (response) {
                model.set({url: location.origin + '/#online/join?id=' + response.uuid, status: response.status});
                this.uuid = response.uuid;
                // TODO update status
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
            this.player = _.extend(this.player, {mode: 'human', type: 'local'});
            var player = _.extend(response, {mode: 'human', type: 'remote'});

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
                el: $('.status-wrapper', this.$el),
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
