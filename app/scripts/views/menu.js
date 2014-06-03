define(['vendor/lodash', 'vendor/backbone',
    'text!templates/menu/home.html',
    'text!templates/menu/single.html'
], function (_, Backbone, HomeTpl, SingleTpl) {
    'use strict';
    var Menu = {};

    Menu.Home = Backbone.View.extend({

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

    Menu.Single = Backbone.View.extend({

        template: _.template(SingleTpl),

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

    return Menu;
});
