define(['vendor/backbone'], function (Backbone) {
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
            'online/create'     : 'create',
            'online/join'       : 'join',
            'tutorial'          : 'tutorial',
            'about'             : 'about'
        },

        initialize: function (Game) {
            this.on('route:single', Game.singleGame, Game);
            this.on('route:home', Game.homeView, Game);
            this.on('route:human', Game.vsHuman, Game);
            this.on('route:easy', Game.vsEasy, Game);
            this.on('route:medium', Game.soon, Game);
            this.on('route:hard', Game.soon, Game);
            this.on('route:online', Game.online, Game);
            this.on('route:create', Game.createGame, Game);
            this.on('route:join', Game.joinGame, Game);
            this.on('route:tutorial', Game.soon, Game);
            this.on('route:about', Game.soon, Game);
        }

    });

});
