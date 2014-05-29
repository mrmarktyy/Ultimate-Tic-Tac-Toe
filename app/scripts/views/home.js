define(['vendor/lodash', 'vendor/backbone', 'text!templates/home.html'], function (_, Backbone, HomeTpl) {
    'use strict';

    var Home = Backbone.View.extend({

        template: _.template(HomeTpl),

        initialize: function (options) {
            this.options = options || {};

            this.render();
            return this;
        },

        render: function () {
            this.$el.html(this.template());

            return this;
        }

    });

    return Home;

});
