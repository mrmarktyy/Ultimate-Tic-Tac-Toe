define(['vendor/backbone'], function (Backbone) {
    'use strict';

    return Backbone.Router.extend({
        routes: {
            ''          : 'home',
            'single'    : 'single',
            'online'    : 'online',
            'tutorial'  : 'tutorial',
            'about'     : 'about'
        },

        initialize: function (Game) {
            this.game = Game || {};
        },

        home: function () {
            this.game.trigger('navigate:home');
        },

        single: function () {
            this.game.trigger('navigate:single');
        },

        online: function () {
            this.game.trigger('navigate:online');
        },

        tutorial: function () {
            this.game.trigger('navigate:tutorial');
        },

        about: function () {
            this.game.trigger('navigate:about');
        }


    });

});
