define(['vendor/backbone', 'utils/helper'],
function (Backbone, Helper) {
    'use strict';

    var Message = Backbone.Model.extend({

        defaults: {
            from: 'System'
        },

        initialize: function () {
            var date = new Date();
            this.set({
                'time_display': Helper.pad(date.getHours()) +
                            ':' + Helper.pad(date.getMinutes()) +
                            ':' + Helper.pad(date.getSeconds())
            });
        },

    });

    return Message;
});
