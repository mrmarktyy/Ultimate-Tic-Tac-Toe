define(['vendor/backbone', 'models/cell', 'views/cell'], function (Backbone, Cell, CellView) {

    var Square = Backbone.Collection.extend({

        model: Cell,

        initialize: function (models, options) {

        }

    });

    return Square;

});
