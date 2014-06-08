define(['vendor/lodash', 'vendor/jquery', 'resolvers/resolver'], function (_, $, Resolver) {
    'use strict';

    var OnlineResolver = Resolver.extend({

        init: function () {
            window._socket.on('move', _.bind(this.moveListener, this));
        },

        getNextMove: function (lastMove, validSquares) {
            this.deferred = new $.Deferred();

            return this.deferred.promise();
        },

        moveListener: function (response) {
            this.deferred.resolve({
                _squareIndex: response.square,
                _cellIndex: response.cell
            });
        }

    });

    return OnlineResolver;
});
