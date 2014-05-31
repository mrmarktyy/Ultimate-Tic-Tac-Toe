define(['vendor/lodash', 'vendor/jquery', 'resolver'], function (_, $, Resolver) {
    'use strict';

    var HumanResolver = Resolver.extend({

        getNextMove: function () {
            this.deferred = new $.Deferred();
            this.on('cell:move', this.cellMoveListener, this);

            return this.deferred.promise();
        },

        cellMoveListener: function (cellModel) {
            cellModel.setValue(this.player.get('role'));
            this.deferred.resolve(cellModel);
            this.off('cell:move', this.cellMoveListener);
        }

    });

    return HumanResolver;

});
