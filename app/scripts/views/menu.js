define(['vendor/lodash', 'vendor/backbone',
    'text!templates/menu/home.html',
    'text!templates/menu/single.html',
    'text!templates/menu/comingsoon.html'
], function (_, Backbone, HomeTpl, SingleTpl, ComingSoonTpl) {
    'use strict';

    var Menu = {};

    Menu.Base = Backbone.View.extend({
        outAnimation: 'bounceOutRight',
        inAnimation: 'bounceInLeft',

        initialize: function (options) {
            this.options = options || {};
            this.render();
            return this;
        },
        render: function () {
            var hasSlider = this.$('.slider').length;
            if (hasSlider) {
                this.$('.slider').addClass(this.outAnimation);
                _.delay(_.bind(this.renderSlider, this), 600);
            } else {
                this.renderSlider();
            }
            return this;
        },
        renderSlider: function () {
            this.$el.html(this.template()).find('.slider').addClass(this.inAnimation);
        }
    });

    Menu.Home = Menu.Base.extend({
        template: _.template(HomeTpl),
    });

    Menu.Single = Menu.Base.extend({
        template: _.template(SingleTpl),
    });

    Menu.ComingSoon = Menu.Base.extend({
        template: _.template(ComingSoonTpl),
    });

    return Menu;
});
