define(['vendor/lodash', 'vendor/backbone', 'views/menu', 'views/modals/nickname', 'utils/storage'],
function (_, Backbone, Menu, NicknameModal, Storage) {
    'use strict';

    return Backbone.Router.extend({
        routes: {
            ''                  : 'home',
            'single'            : 'single',
            'single/human'      : 'human',
            'single/easy'       : 'easy',
            'single/medium'     : 'medium',
            'single/hard'       : 'hard',
            'online'            : 'online',
            'online/friend'     : 'friend',
            'online/join'       : 'join',
            'online/pair'       : 'pair',
            'tutorial'          : 'tutorial',
            'about'             : 'about'
        },

        initialize: function (Game) {
            this.$el = Game.$el;
            this.game = Game;
            this.on('route:human', Game.vsHuman, Game);
            this.on('route:easy', this.checkNickname);
            this.on('route:medium', Game.vsMedium, Game);
            this.on('route:hard', this.soon);
            this.on('route:friend', Game.playWithFriend, Game);
            this.on('route:join', Game.joinGame, Game);
            this.on('route:pair', Game.pairGame, Game);
            this.on('route:tutorial', this.soon);
            this.$el.on('click', '.back', _.bind(this.back, this));

            this.nicknameModal = new NicknameModal({
                el: this.$el,
                router: this
            });
        },

        checkNickname: function (event) {
            var route = Backbone.history.fragment.split('/')[1];
            var callback = this.game[route];
            if (_.isFunction(callback)) {
                if (Storage.get('nickname')) {
                    callback.call(this.game);
                } else {
                    this.nicknameModal.show(callback);
                }
            } else {
                throw 'Invalid route: ' + Backbone.history.fragment;
            }
        },

        home: function () {
            new Menu.Home({
                el: this.$el
            });
        },

        single: function () {
            new Menu.Single({
                el: this.$el
            });
        },

        online: function () {
            new Menu.Online({
                el: this.$el
            });
        },

        about: function () {
            new Menu.About({
                el: this.$el
            });
        },

        soon: function () {
            new Menu.ComingSoon({
                el: this.$el
            });
        },

        back: function () {
            var route = Backbone.history.fragment;
            this.navigate(route.substring(0, _.lastIndexOf(route, '/')), {trigger: true});
        }

    });

});
