define(['vendor/backbone', 'vendor/lodash'], function (Backbone, _) {
    'use strict';

    var Status = Backbone.Model.extend({

        defaults: {
            round: 1,
            role: 1,
            winner: 0,
            movement: []  // [squareIndex, cellIndex, Role]
        },

        initialize: function (options) {

        },

        getLastMove: function () {
            return _.last(this.get('movement'));
        },

        finishRound: function (cellModel, squareIndex, cellIndex) {
            this.roundInc();
            this.addMovement([squareIndex, cellIndex, this.get('role')]);
            this.swapRole();
        },

        roundInc: function () {
            this.set('round', this.get('round') + 1);
        },

        addMovement: function (movement) {
            this.get('movement').push(movement);
        },

        swapRole: function () {
            this.set('role', this.get('role') === 1 ? 2 : 1);
        }

    });

    return Status;
});
