define(['vendor/backbone', 'vendor/lodash'], function (Backbone, _) {
    'use strict';

    var Status = Backbone.Model.extend({

        defaults: {
            round: 1,
            role: 0,
            uuid: undefined,
            owner: 0,
            mode: 'local',
            winner: 0,
            movement: []  // [squareIndex, cellIndex, Role]
        },

        initialize: function (options) {

        },

        getLastMove: function () {
            return _.last(this.get('movement'));
        },

        update: function (cellModel, squareIndex, cellIndex) {
            this.roundInc();
            this.pushMovement([squareIndex, cellIndex, this.get('role')]);
            this.swapRole();
        },

        undoMove: function () {
            this.swapRole();
            return this.popMovement();
        },

        roundInc: function () {
            this.set('round', this.get('round') + 1);
        },

        pushMovement: function (movement) {
            this.get('movement').push(movement);
        },

        popMovement: function () {
            return this.get('movement').pop();
        },

        swapRole: function () {
            this.set('role', this.get('role') === 1 ? 2 : 1);
        },

        isRemote: function () {
            return this.get('mode') === 'remote';
        }

    });

    return Status;
});
