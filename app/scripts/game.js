define(['vendor/backbone', 'views/board', 'collections/squares'], function (Backbone, Board, Squares) {

    function Game (options) {
        this.options = options || {};

        return this;
    }

    _.extend(Game.prototype, {

        init: function () {

            // var squares = _.isEmpty(this.options.data) ? new Squares() : new Squares(this.options.data);
            var squares = new Squares();

            this.board = new Board({
                el: this.options.el,
                collection: squares
            });

            console.log('squares', this.board.collection.models);
            console.log('cells', this.board.collection.models[0].models);

        }


    }, Backbone.Events);

    return Game;
});
