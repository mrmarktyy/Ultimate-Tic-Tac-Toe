define(['vendor/lodash', 'vendor/backbone', 'vendor/jquery',
    'router', 'engine',
    'views/board', 'views/status', 'views/chat',
    'models/status', 'models/player',
    'utils/socket', 'utils/helper',
    'text!templates/layout.html',
    'collections/squares', 'collections/messages'],
function (_, Backbone, $, AppRouter, Engine, Board, StatusView, ChatView, StatusModel, Player, Socket, Helper, LayoutTpl, Squares, Messages) {
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
            this.initGame(
                new StatusModel(),
                Helper.getEmptyState(),
                new Player({role: 1, nickname: 'mark'}),
                new Player({role: 2, nickname: 'junjun'})
            );
            this.engine.start();
        },

        vsEasy: function () {
            this.initGame(
                new StatusModel({owner: 1}),
                Helper.getEmptyState(),
                new Player({role: 1, nickname: 'mark'}),
                new Player({role: 2, nickname: 'Easy Computer', mode: 'computer'})
            );
            this.engine.start();
        },

        playWithFriend: function () {
            // model.set({url: location.origin + '/#online/join?id=' + response.uuid, status: response.status});
            this.player = {role: 1, nickname: 'mark', mode: 'human', type: 'local'};
            var status = new StatusModel({owner: this.player.role, mode: 'remote'});

            Socket.listenTo('game:start', _.bind(this.prepareGame, this));
            Socket.createGame(this.player).done(_.bind(function (response) {
                status.set('uuid', response.uuid);
            }, this));

            this.initGame(
                status,
                Helper.getEmptyState(),
                new Player(this.player)
            );
        },

        joinGame: function (queryString) {
            this.player = {role: 2, nickname: 'junjun', mode: 'human', type: 'local'};
            var uuid = Helper.getQueryParams(queryString).id;
            if (uuid) {
                var status = new StatusModel({uuid: uuid, owner: this.player.role, mode: 'remote'});
                Socket.listenTo('game:start', _.bind(this.prepareGame, this));
                Socket.joinGame(uuid, this.player);

                this.initGame(
                    status,
                    Helper.getEmptyState(),
                    undefined,
                    new Player(this.player)
                );
            }
        },

        prepareGame: function (response) {
            this.engine
                .setPlayer(
                    response.role,
                    new Player(_.extend({}, response.player, {mode: 'human', type: 'remote'}))
                )
                .start();
        },

        initGame: function (status, state, player1, player2) {
            this.$el.html(LayoutTpl);
            this.initBoardView(state);
            this.initEngine(this.board, status, player1, player2);
            this.initStatusView(status);
            this.initChatView();
        },

        initBoardView: function (state) {
            this.board = new Board({
                el: $('.board', this.$el),
                collection: new Squares(state),
            });
        },

        initEngine: function (board, status, player1, player2) {
            this.engine = Engine.getInstance({
                board: board,
                status: status,
                player1: player1,
                player2: player2
            });
        },

        initStatusView: function (status) {
            this.status = new StatusView({
                el: $('.status', this.$el),
                model: status
            });
        },

        initChatView: function () {
            this.chat = new ChatView({
                el: $('.chat', this.$el),
                collection: new Messages([
                    {from: 'System', content: 'Welcome to join the Utimate Tic Tac Toe, Hope you\'ll enjoy it'}
                ])
            });
        },

        /***************** Event handlers *****************/

        back: function () {
            var routes = Backbone.history.fragment.split('/');
            routes.pop();
            this.router.navigate('#' + routes.join('/'), {trigger: true});
        },

        /***************** Miscellaneous methods *****************/

    }, Backbone.Events);

    return Game;
});
