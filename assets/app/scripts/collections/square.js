define(['vendor/lodash', 'vendor/backbone', 'models/cell'],
function (_, Backbone, Cell) {
    'use strict';

    var Square = Backbone.Collection.extend({

        model: Cell,

        initialize: function (models, options) {

        }

    });

    return Square;

});
