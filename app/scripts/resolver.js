define(['vendor/lodash', 'vendor/backbone'], function (_, Backbone) {
    'use strict';

    function Resolver(player) {
        this.player = player;
    }

    _.extend(Resolver.prototype, Backbone.Events, {

        /**
         * To be overriden by child instance
         */
        getNextMove: function () {

        }

    });

    Resolver.extend = Backbone.Model.extend;

    return Resolver;
});
