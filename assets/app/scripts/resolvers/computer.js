define(['vendor/lodash', 'vendor/jquery', 'engine', 'resolvers/resolver'],
function (_, $, Engine, Resolver) {
    'use strict';

    var ComputerResolver = Resolver.extend({

        getNextMove: function (lastMove, validSquares) {
            this.deferred = new $.Deferred();
            this.once('cell:move', this.moveListener, this);
            _.defer(_.bind(this.computeMove, this), lastMove, validSquares);
            return this.deferred.promise();
        },

        computeMove: function (lastMove, validSquares) {
            var state = Engine.getInstance().board.getState();
            var _randomSquareIndex = _.sample(validSquares);
            var _randomCellIndex = _.sample(
                _.filter(
                    _.map(
                        _.clone(state[_randomSquareIndex]),
                        function (v, i) {
                            v.index = i;
                            return v;
                        }),
                    function (v) {
                        return v.value === 0;
                    })
                ).index;
            // mimic 1-2 second delay for each move
            _.delay(function () {
                Engine.getInstance().trigger(
                    'player:move',
                    _randomSquareIndex,
                    _randomCellIndex,
                    true);
            }, _.random(1000, 2000));
        }

    });

    return ComputerResolver;
});
