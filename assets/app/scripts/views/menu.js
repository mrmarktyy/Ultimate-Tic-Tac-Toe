define(['vendor/lodash', 'vendor/backbone',
    'text!templates/menu/home.html',
    'text!templates/menu/single.html',
    'text!templates/menu/online.html',
    'text!templates/menu/about.html',
    'text!templates/menu/soon.html'
], function (_, Backbone, HomeTpl, SingleTpl, OnlineTpl, AboutTpl, SoonTpl) {
    'use strict';

    var Menu = {};

    Menu.Base = Backbone.View.extend({
        outAnimation        : 'bounceOutRight',
        inAnimation         : 'bounceInLeft',
        hideSliderDelay     : 600,

        initialize: function (options) {
            this.options = options || {};
            this.render();
            return this;
        },
        render: function () {
            if (this.$('.slider').length) {
                this.$('.slider').addClass(this.outAnimation);
                _.delay(_.bind(this.renderSlider, this), this.hideSliderDelay);
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

    Menu.Online = Menu.Base.extend({
        template: _.template(OnlineTpl),
    });

    Menu.About = Menu.Base.extend({
        template: _.template(AboutTpl),
    });

    Menu.ComingSoon = Menu.Base.extend({
        template: _.template(SoonTpl),
    });

    return Menu;
});
