define(['vendor/backbone', 'vendor/lodash', 'engine', 'text!templates/status.html'],
function (Backbone, _, Engine, StatusTpl) {
    'use strict';

    var Status = Backbone.View.extend({

        template: _.template(StatusTpl),

        initialize: function (options) {
            this.options = options || {};
            this.listenTo(this.model, 'change', this.render);
            this.render();
        },

        render: function () {
            this.$el.html(this.template({
                role: this.model.get('role'),
                owner: this.model.get('owner'),
                player1: Engine.getInstance().player1,
                player2: Engine.getInstance().player2
            }));
            return this;
        }

    });

    return Status;
});
