define(['vendor/backbone', 'utils/helper'],
function (Backbone, Helper) {
    'use strict';

    var Message = Backbone.Model.extend({

        defaults: {
            date: new Date()
        },

        initialize: function () {
            var date = this.get('date');
            this.set(
                'time_display', Helper.pad(date.getHours()) +
                            ':' + Helper.pad(date.getMinutes()) +
                            ':' + Helper.pad(date.getSeconds())
            );
        },

    });

    return Message;
});
