define(['vendor/backbone'], function (Backbone) {
    'use strict';

    var Player = Backbone.Model.extend({

        defaults: {
            _id: 1,
            nickname: undefined,
            rank: undefined,
            score: undefined,

            uid: undefined,
            sex: undefined,
            country: undefined
        },

        initialize: function (options) {

        }

    });

    return Player;
});
