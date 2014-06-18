define(['vendor/lodash', 'vendor/backbone', 'models/message'],
function (_, Backbone, Message) {
    'use strict';

    return Backbone.Collection.extend({

        model: Message,

        initialize: function (models, options) {

        }

    });
});
