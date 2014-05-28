define(['vendor/backbone'], function (Backbone) {

    var Cell = Backbone.View.extend({

        className: 'cell',

        initialize: function (options) {
            this.listenTo(this.model, 'change:value', this.render);
        },

        render: function () {
            if (this.model.get('value')) {
                this.$el.addClass('o p' + this.model.get('value'));
            }
            return this;
        }

    });


    return Cell;
});
