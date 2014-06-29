define(['vendor/backbone', 'views/menu'],
function (Backbone, Menu) {
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
            this.on('route:home', this.homeView);
            this.on('route:single', this.singleGame);
            this.on('route:online', this.online);
            this.on('route:human', Game.vsHuman, Game);
            this.on('route:easy', Game.vsEasy, Game);
            this.on('route:medium', Game.vsMedium, Game);
            this.on('route:hard', this.soon);
            this.on('route:friend', Game.playWithFriend, Game);
            this.on('route:join', Game.joinGame, Game);
            this.on('route:pair', Game.pairGame, Game);
            this.on('route:tutorial', this.soon);
            this.on('route:about', this.about);
        },

        homeView: function () {
            new Menu.Home({
                el: this.$el
            });
        },

        singleGame: function () {
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
        }

    });

});
