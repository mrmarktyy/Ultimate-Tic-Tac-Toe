define(['vendor/lodash', 'vendor/backbone'], function (_, Backbone) {

    function Engine (options) {
        this.options = options || {};
        this.state = this.options.state;
        this.status = this.options.status;
        this.player1 = this.options.player1;
        this.player2 = this.options.player2;
    }

    _.extend(Engine.prototype, {

        nextMove: function () {


        }


    }, Backboen.Event);


    return Engine;
});
