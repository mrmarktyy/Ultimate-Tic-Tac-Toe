define(['vendor/backbone', 'views/cell', 'utils/helper'],
function (Backbone, CellView, Helper) {
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
            } else {
                this.$el.removeClass('p1 p2');
                if (!this.checkAvailability()) {
                    this.setInvalid();
                }
            }
        },

        getCell: function (index) {
            return this._cells[index];
        },

        setInvalid: function () {
            this.$el.addClass('invalid');
        },

        setValid: function () {
            this.$el.addClass('moveable valid');
        },

        removeValid: function () {
            this.$el.removeClass('moveable valid');
        },

        showGuide: function () {
            this.$el.addClass('guide');
        },

        hideGuide: function () {
            this.$el.removeClass('guide');
        },

        checkRole: function () {
            this.value = Helper.checkRole(this.collection.toJSON());
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
