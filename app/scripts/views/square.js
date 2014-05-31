define(['vendor/backbone', 'views/cell'], function (Backbone, CellView) {
    'use strict';

    var Square = Backbone.View.extend({

        className: 'square',

        initialize: function (options) {
            this.options = options || {};
            this._index = this.options._index;
            this._cells = [];
        },

        render: function () {
            this.collection.each(function (Cell, index) {
                var cellView = new CellView({
                    model: Cell,
                    _index: index,
                    _square: this._index
                });
                this.$el.append(cellView.render().$el);
                this._cells.push(cellView);
            }, this);
            return this;
        }

    });


    return Square;
});
