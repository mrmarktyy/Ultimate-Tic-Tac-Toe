define(['vendor/backbone', 'vendor/lodash', 'engine', 'text!templates/game/friendCreate.html'],
function (Backbone, _, Engine, FriendCreateTpl) {
    'use strict';

    return Backbone.View.extend({

        template: _.template(FriendCreateTpl),

        events: {

        },

        initialize: function (options) {
            this.listenTo(this.model, 'change', this.render);
            this.render();
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

});
