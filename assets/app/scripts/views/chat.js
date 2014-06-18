define(['vendor/backbone', 'vendor/lodash', 'engine', 'text!templates/chat.html'],
function (Backbone, _, Engine, ChatTpl) {
    'use strict';

    var Chat = Backbone.View.extend({

        template: _.template(ChatTpl),

        initialize: function (options) {
            this.options = options || {};
            // this.listenTo(this.model, 'change', this.render);
            this.render();
        },

        render: function () {
            console.log(this.$el);
            this.$el.html(this.template({
                messages: this.collection.toJSON()
            }));
            return this;
        }

    });

    return Chat;
});
