define(['vendor/backbone'], function (Backbone) {
    'use strict';

    var Cell = Backbone.Model.extend({

        defaults: {
            value: 0
        },

        initialize: function (options) {

        },

        setValue: function (role) {
            this.set('value', role);
        }

    });

    return Cell;
});
