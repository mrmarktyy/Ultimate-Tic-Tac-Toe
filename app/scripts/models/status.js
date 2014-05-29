define(['vendor/backbone'], function (Backbone) {
    'use strict';

    var Status = Backbone.Model.extend({

        defaults: {
            round: 0,
            turn: 1,
        },

        initialize: function (options) {

        }

    });

    return Status;
});
