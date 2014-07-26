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
            'rules'             : 'rules',
            'about'             : 'about'
        },

        initialize: function (Game) {
            this.Game = Game;
            this.$el = this.Game.$el;
            this.on('route:human', this.Game.vsHuman, this.Game);
            this.on('route:easy route:medium route:friend route:join route:pair',
                this.checkNickname);
            this.on('route:hard', this.soon);
            this.$el.on('click', '.back', _.bind(this.back, this));

            this.nicknameModal = new NicknameModal({
                el: this.$el,
                router: this
            });
        },

        checkNickname: function (event) {
            var fragment = Backbone.history.fragment,
                route = fragment.split('/')[1],
                _index, queryString;
            if ((_index = route.indexOf('?')) !== -1) {
                queryString = route.substring(_index + 1);
                route = route.substring(0, _index);
            }
            var callback = _.bind(this.Game[route], this.Game);
            if (_.isFunction(callback)) {
                if (Storage.get('nickname')) {
                    callback(queryString);
                } else {
                    this.nicknameModal.show(callback, queryString);
                }
            } else {
                throw 'Invalid fragment: ' + fragment;
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

        rules: function () {
            new Menu.Rules({
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
