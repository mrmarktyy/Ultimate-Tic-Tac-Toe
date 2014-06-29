define(['vendor/backbone', 'vendor/lodash', 'engine', 'utils/storage', 'text!templates/modals/nickname.html'],
function (Backbone, _, Engine, Storage, NicknameTpl) {
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
                    Storage.remove('nickname');
                    this.hide('#online');
                }), this);
        }

    });

    return NicknameModal;
});
