define(['vendor/lodash', 'vendor/backbone', 'engine', 'utils/storage', 'text!templates/modals/nickname.html'],
function (_, Backbone, Engine, Storage, NicknameTpl) {
    'use strict';

    var NicknameModal = Backbone.View.extend({
        outAnimation        : 'bounceOutRight',
        inAnimation         : 'bounceInDown',

        template: _.template(NicknameTpl),

        events: {
            'click .nickname__continue' : 'continue',
            'click .nickname__cancel'   : 'cancel',
        },

        initialize: function (options) {
            this.router = options.router;
        },

        show: function (callback, queryString) {
            this.$el.prepend(this.template());
            this.success = callback;
            this.queryString = queryString;
        },

        hide: function (route) {
            this.$('.overlay').remove();
            if (route) {
                this.router.navigate(route, {replace: true});
            }
        },

        continue: function () {
            Storage.set('nickname', this.$('.nickname__input').val());
            this.hide();
            if (_.isFunction(this.success)) {
                this.success(this.queryString);
            }
            this.$('.nickname__input').val('');
        },

        cancel: function () {
            this.$('.modal')
                .removeClass(this.inAnimation)
                .addClass(this.outAnimation)
                .one('webkitAnimationEnd', _.bind(function (event) {
                    var route = Backbone.history.fragment;
                    this.hide(route.substring(0, _.lastIndexOf(route, '/')));
                    Storage.remove('nickname');
                }, this));
        }

    });

    return NicknameModal;
});
