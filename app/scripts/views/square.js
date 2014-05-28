define(['vendor/backbone', 'views/cell'], function (Backbone, CellView) {

    var Square = Backbone.View.extend({

        className: 'square',

        initialize: function (options) {
            this.options = options || {};
            this._cells = [];
        },

        render: function () {
            this.collection.each(function (Cell) {
                var cellView = new CellView({
                    model: Cell
                });
                this.$el.append(cellView.render().$el);
                this._cells.push(cellView);
            }, this);
            return this;
        }

    });


    return Square;
});
