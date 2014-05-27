define(['vendor/backbone', 'models/cell', 'views/cell'], function (Backbone, Cell, CellView) {

    var Square = Backbone.Collection.extend({

        model: Cell,

        initialize: function (models, options) {
            this.createNew(options);
            return this;
        },

        createNew: function (options) {
            this._id = options.at;
            // for (var i = 0; i < 9; i++) {
                this.push({ '_id': 0 });
            // }
        }

    });

    return Square;

});
