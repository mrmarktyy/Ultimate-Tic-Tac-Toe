define(['vendor/backbone', 'engine'], function (Backbone, Engine) {
    'use strict';

    var Cell = Backbone.View.extend({

        className: 'cell',

        events: {
            'click':    'movehere'
        },

        initialize: function (options) {
            this._index = options._index;
            this._squareIndex = options._square;
            this.listenTo(this.model, 'change:value', this.render);
        },

        render: function () {
            if (this.model.get('value')) {
                this.$el.addClass('o p' + this.model.get('value'));
            }
            return this;
        },

        movehere: function (event) {
            if ($(event.target).parent().hasClass('moveable')) {
                Engine.getInstance().trigger('cell:move', this.model, this._squareIndex, this._index);
            } else {
                console.log('Invalid move');
            }
        }

    });


    return Cell;
});
