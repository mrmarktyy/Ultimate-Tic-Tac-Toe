define(['vendor/backbone', 'vendor/lodash', 'engine', 'utils/socket', 'utils/helper', 'text!templates/chat.html', 'text!templates/message.html'],
function (Backbone, _, Engine, Socket, Helper, ChatTpl, MessageTpl) {
    'use strict';

    var Chat = Backbone.View.extend({

        template: _.template(ChatTpl),

        messageTemplate: _.template(MessageTpl),

        events: {
            'keyup .chat__input':        'enter'
        },

        initialize: function (options) {
            this.options = options || {};
            this.status = this.options.status;
            if (this.status.isRemote()) {
                Socket.listenTo('game:chat', _.bind(this.receiveMessage, this));
            }
            this.listenTo(this.collection, 'add', this.appendMessage);
            this.render();
        },

        render: function () {
            this.$el.html(this.template());
            this.collection.each(function (message) {
                this.appendMessage(message);
            }, this);
            return this;
        },

        enter: function (event) {
            if (event.keyCode === 13) {
                var message = $(event.currentTarget).val();
                if (message) {
                    var player = Engine.getInstance()['player' + this.status.get('owner')];
                    this.addMessage({
                        from: player.get('nickname'),
                        content: Helper.escape(message)
                    });
                    this.postMessage(message);
                    this.$('.chat__input').val('');
                }
            }
        },

        addMessage: function (message) {
            this.collection.add(message);
        },

        appendMessage: function (message) {
            this.$('.chat__contents').append(
                this.messageTemplate(message.toJSON())
            );
        },

        receiveMessage: function (message) {
            var oppRole = this.status.get('owner') === 1 ? 2 : 1;
            var player = Engine.getInstance()['player' + oppRole];
            this.addMessage({
                from: player.get('nickname'),
                content: message
            });
        },

        postMessage: function (message) {
            if (this.status.isRemote()) {
                Socket.sendMessage(this.status.get('uuid'), message);
            }
        }

    });

    return Chat;
});
