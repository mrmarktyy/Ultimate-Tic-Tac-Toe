define(['vendor/backbone', 'models/cell', 'views/cell'], function (Backbone, Cell, CellView) {
    'use strict';

    var Square = Backbone.Collection.extend({

        model: Cell,

        initialize: function (models, options) {

        }

    });

    return Square;

});
