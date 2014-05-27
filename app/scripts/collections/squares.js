define(['vendor/lodash', 'vendor/backbone', 'collections/square'], function (_, Backbone, Square) {

    var Squares = Backbone.Collection.extend({

        model: Square,

        initialize: function (data) {
            if (_.isEmpty(data)) {
                this.createNew();
            }
            return this;
        },

        createNew: function () {
            // for (var i = 0; i < 9; i++) {
                this.push([], {
                    '_id': 0
                });
            // }
        }

    });

    return Squares;

});
