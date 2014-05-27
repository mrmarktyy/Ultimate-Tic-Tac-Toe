define(['vendor/lodash', 'vendor/backbone', 'text!templates/board.html'], function (_, Backbone, boardTpl) {

    var Board = Backbone.View.extend({

        template: _.template(boardTpl),

        initialize: function () {
            // this._squares = [];

            this.render();
            return this;
        },

        render: function () {
            // this.collection.each(function (square) {
            //     this._squares.push(new Square)
            // });
            this.$el.html(this.template({message: 'hello'}));
            return this;
        }

    });

    return Board;

});
