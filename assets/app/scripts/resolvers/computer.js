define(['vendor/lodash', 'vendor/jquery', 'engine', 'resolvers/resolver'], function (_, $, Engine, Resolver) {
    'use strict';

    var ComputerResolver = Resolver.extend({

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
            // mimic 1 second delay for each move
            _.delay(function () {
                Engine.getInstance().trigger(
                    'player:move',
                    _randomSquareIndex,
                    _randomCellIndex);
            }, 1000);
        }

    });

    return ComputerResolver;
});
