define(['vendor/backbone', 'vendor/lodash', 'engine'], function (Backbone, _, Engine) {
    'use strict';

    var Cell = Backbone.View.extend({

        className: 'cell',

        events: {
            'click':    'movehere'
        },

        initialize: function (options) {
            this.options = options || {};
            this._index = this.options._index;
            this._square = this.options._square;
            this._board = this.options._board;
            this._squareIndex = this._square._index;
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
