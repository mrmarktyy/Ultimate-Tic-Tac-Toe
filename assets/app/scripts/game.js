define(['vendor/lodash', 'vendor/backbone', 'vendor/jquery',
    'router', 'engine',
    'views/board', 'views/status', 'views/chat', 'views/modals/nickname',
    'models/status', 'models/player',
    'utils/socket', 'utils/helper', 'utils/storage',
    'text!templates/layout.html',
    'collections/squares', 'collections/messages'],
function (_, Backbone, $,
    AppRouter, Engine,
    Board, StatusView, ChatView, NicknameModal,
    StatusModel, Player,
    Socket, Helper, Storage,
    LayoutTpl,
    Squares, Messages) {
    'use strict';

    function Game (options) {
        this.options = options || {};
        this.$el = $(this.options.el);
    }

    _.extend(Game.prototype, Backbone.Events, {

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
                Helper.getInitialState(),
                new Player({role: 1, nickname: 'Player Red'}),
                new Player({role: 2, nickname: 'Player Blue'})
            );

            this.engine.start();
        },

        easy: function () {
            this.initGame(
                new StatusModel({owner: 1}),
                Helper.getInitialState(),
                new Player({role: 1, nickname: Storage.get('nickname') || 'Unknown'}),
                new Player({role: 2, nickname: 'Easy Computer', mode: 'computer', difficulty: 'easy'})
            );

            this.engine.start();
        },

        medium: function () {
            this.initGame(
                new StatusModel({owner: 1}),
                Helper.getInitialState(),
                new Player({role: 1, nickname: Storage.get('nickname') || 'Unknown'}),
                new Player({role: 2, nickname: 'Medium Computer', mode: 'computer', difficulty: 'medium'})
            );

            this.engine.start();
        },

        friend: function () {
            this.player = {role: 1, nickname: Storage.get('nickname')};
            Socket.listenTo('game:start', _.bind(this.prepareGame, this));
            Socket.createGame(this.player).done(_.bind(function (response) {
                this.player.nickname = response.nickname;

                this.initGame(
                    new StatusModel({
                        uuid: response.uuid,
                        owner: this.player.role,
                        mode: 'remote'
                    }),
                    Helper.getInitialState(),
                    new Player(this.player)
                );

                this.chatView.addMessage({
                    content: 'Please send below url to your friend for joining the game.  <strong>' +
                        window.location.origin + '/#online/join?id=' + response.uuid + '</strong>'
                });
            }, this));
        },

        join: function (queryString) {
            this.player = {role: 2, nickname: Storage.get('nickname')};
            var uuid = Helper.getQueryParams(queryString).id;
            if (uuid) {
                Socket.listenTo('game:start', _.bind(this.prepareGame, this));
                Socket.joinGame(uuid, this.player).done(_.bind(function (response) {
                    this.player.nickname = response.nickname;

                    this.initGame(
                        new StatusModel({
                            uuid: uuid,
                            owner: this.player.role,
                            mode: 'remote'
                        }),
                        Helper.getInitialState(),
                        undefined,
                        new Player(this.player)
                    );
                }, this));
            }
        },

        pair: function () {
            this.player = {nickname: Storage.get('nickname')};
            Socket.listenTo('game:start', _.bind(this.prepareGame, this));
            Socket.pairGame(this.player).done(_.bind(function (response) {
                _.extend(this.player, response.player);
                var statusModel = new StatusModel({
                    uuid: response.uuid,
                    owner: this.player.role,
                    mode: 'remote',
                    showOnlinePlayers: true,
                    onlinePlayers: response.players
                });
                this.initGame(
                    statusModel,
                    Helper.getInitialState()
                );

                this.engine
                    .setPlayer(
                        this.player.role,
                        new Player(this.player)
                    );

                this.chatView.addMessage({
                    content: 'Please wait for a player to join the game.'
                });

                Socket.listenTo('game:players', function (response) {
                    statusModel.updateOnlinePlayers(response);
                });
            }, this));
        },

        prepareGame: function (response) {
            this.chatView.addMessage({
                content: 'Player ' + response.player.nickname + ' has joined. Game started.'
            });
            Socket.listenTo('game:leave', _.bind(function () {
                this.chatView.addMessage({
                    content: 'Ops, Looks like player ' + response.player.nickname + ' has just left the game.'
                });
            }, this));
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
            this.initChatView(status);
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

        initChatView: function (status) {
            this.chatView = new ChatView({
                el: $('.chat', this.$el),
                status: status,
                collection: new Messages([
                    {content: 'Welcome to the Utimate Tic Tac Toe, Hope you\'ll enjoy it!'}
                ])
            });
        },

        /***************** Miscellaneous methods *****************/

    });

    return Game;
});
