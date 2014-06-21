define(['vendor/backbone', 'vendor/lodash', 'engine', 'text!templates/chat.html', 'text!templates/message.html'],
function (Backbone, _, Engine, ChatTpl, MessageTpl) {
    'use strict';

    var Chat = Backbone.View.extend({

        template: _.template(ChatTpl),

        messageTemplate: _.template(MessageTpl),

        initialize: function (options) {
            this.options = options || {};
            this.listenTo(this.collection, 'add', this.add);
            this.render();
        },

        render: function () {
            this.$el.html(this.template());
            this.collection.each(function (message) {
                this.add(message);
            }, this);
            return this;
        },

        add: function (message) {
            this.$('.chat__contents').append(
                this.messageTemplate(message.toJSON())
            );
        },

        send: function (message) {
            this.collection.add(message);
        }

    });

    return Chat;
});
