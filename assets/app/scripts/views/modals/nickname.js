define(['vendor/lodash', 'vendor/backbone', 'engine', 'utils/storage', 'text!templates/modals/nickname.html'],
function (_, Backbone, Engine, Storage, NicknameTpl) {
    'use strict';

    var NicknameModal = Backbone.View.extend({
        outAnimation        : 'bounceOutRight',
        inAnimation         : 'bounceInDown',
        delay               : 600,

        template: _.template(NicknameTpl),

        events: {
            'click .nickname__continue' : 'continue',
            'click .nickname__cancel'   : 'cancel',
        },

        initialize: function (options) {
            this.router = options.router;
        },

        show: function (callback) {
            this.$el.prepend(this.template());
            this.success = callback;
        },

        hide: function (route) {
            console.log('hide', route);
            this.$('.overlay').remove();
            if (route) {
                this.router.navigate(route, {replace: true});
            }
        },

        continue: function () {
            Storage.set('nickname', this.$('.nickname__input').val());
            this.hide();
            if (_.isFunction(this.success)) {
                this.success();
            }
            this.$('.nickname__input').val('');
        },

        cancel: function () {
            this.$('.modal')
                .removeClass(this.inAnimation)
                .addClass(this.outAnimation)
                .one('webkitAnimationEnd animationend oanimationend', _.bind(function () {
                    console.log('cancel');
                    var route = Backbone.history.fragment;
                    this.hide(route.substring(0, _.lastIndexOf(route, '/')));
                    Storage.remove('nickname');
                }, this));
        }

    });

    return NicknameModal;
});
