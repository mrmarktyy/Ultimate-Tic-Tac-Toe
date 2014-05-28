define(['vendor/lodash', 'vendor/backbone', 'collections/square'], function (_, Backbone, Square) {

    var Squares = Backbone.Collection.extend({

        model: Square,

        initialize: function (models, options) {

        }

    });

    return Squares;

});
