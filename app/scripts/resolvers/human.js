define(['vendor/lodash', 'vendor/jquery', 'resolver'], function (_, $, Resolver) {
    'use strict';

    var HumanResolver = Resolver.extend({

        getNextMove: function () {
            this.deferred = new $.Deferred();
            this.on('cell:move', this.cellMoveListener, this);
            this.on('cell:reject', this.rejectMoveListener, this);

            return this.deferred.promise();
        },

        cellMoveListener: function (cellModel) {
            cellModel.setValue(this.player.get('role'));
            this.deferred.resolve(cellModel);
            this.off('cell:move', this.cellMoveListener);
        },

        rejectMoveListener: function () {
            this.deferred.reject();
        }

    });

    return HumanResolver;

});
