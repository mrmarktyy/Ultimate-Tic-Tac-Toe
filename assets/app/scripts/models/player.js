define(['vendor/backbone', 'resolverFactory'], function (Backbone, resolverFactory) {
    'use strict';

    var Player = Backbone.Model.extend({

        defaults: {
            role: 0,
            mode: 'human',
            type: undefined,
            nickname: undefined,
            rank: undefined,
            score: undefined,

            uid: undefined,
            sex: undefined,
            country: undefined
        },

        initialize: function (options) {
            this.set('resolver', resolverFactory.getResolver(this));
        }

    });

    return Player;
});
