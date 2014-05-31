define(['vendor/backbone', 'views/cell', 'utils/validate'], function (Backbone, CellView, Validate) {
    'use strict';

    var Square = Backbone.View.extend({

        className: 'square',

        initialize: function (options) {
            this.options = options || {};
            this.value = this.options.value || 0;
            this._index = this.options._index;
            this._board = this.options._board;
            this._cells = [];
        },

        render: function () {
            this.collection.each(function (Cell, index) {
                var cellView = new CellView({
                    model: Cell,
                    _index: index,
                    _square: this,
                    _board: this._board
                });
                this.$el.append(cellView.render().$el);
                this._cells.push(cellView);
            }, this);
            this.renderRole();
            return this;
        },

        renderRole: function () {
            if (this.value) {
                this.$el.addClass('p' + this.value);
            }
        },

        setInvalid: function () {
            this.$el.addClass('invalid');
        },

        checkWin: function () {
            this.value = Validate.checkWin(this.collection.toJSON());
            if (!this.value && !this.checkAvailability()) {
                this.setInvalid();
            }
            this.renderRole();
            return this.value;
        },

        checkAvailability: function () {
            var result = false;
            this.collection.each(function (Cell) {
                if (!Cell.get('value')) {
                    result = true;
                    return;
                }
            });
            return result;
        }

    });


    return Square;
});
