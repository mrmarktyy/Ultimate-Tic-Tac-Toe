define(['vendor/lodash', 'vendor/backbone',
    'text!templates/menu/home.html',
    'text!templates/menu/single.html',
    'text!templates/menu/online.html',
    'text!templates/menu/about.html',
    'text!templates/menu/tutorial.html',
    'text!templates/menu/soon.html'
], function (_, Backbone, HomeTpl, SingleTpl, OnlineTpl, AboutTpl, TutorialTpl, SoonTpl) {
    'use strict';

    var Menu = {};

    Menu.Base = Backbone.View.extend({
        outAnimation        : 'bounceOutRight',
        inAnimation         : 'bounceInLeft',
        delay               : 600,

        initialize: function (options) {
            this.options = options || {};
            this.router = this.options.router;
            this.render();
            return this;
        },
        render: function () {
            if (this.$('.slider').length) {
                this.$('.slider').addClass(this.outAnimation);
                _.delay(_.bind(this.renderSlider, this), this.delay);
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
        template: _.template(HomeTpl)
    });

    Menu.Single = Menu.Base.extend({
        template: _.template(SingleTpl)
    });

    Menu.Online = Menu.Base.extend({
        template: _.template(OnlineTpl)
    });

    Menu.About = Menu.Base.extend({
        template: _.template(AboutTpl)
    });

    Menu.Tutorial = Menu.Base.extend({
        template: _.template(TutorialTpl)
    });

    Menu.ComingSoon = Menu.Base.extend({
        template: _.template(SoonTpl)
    });

    return Menu;
});
