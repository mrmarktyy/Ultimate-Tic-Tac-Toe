define(['vendor/backbone'], function (Backbone) {
    'use strict';

    var Cell = Backbone.Model.extend({

        defaults: {
            value: 0
        },

        initialize: function (options) {

        }

    });


    return Cell;
});
