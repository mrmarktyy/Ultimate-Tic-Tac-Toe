define(['vendor/lodash', 'vendor/jquery', 'engine', 'resolvers/resolver', 'utils/helper'],
function (_, $, Engine, Resolver, Helper) {
    'use strict';

    var MediumResolver = Resolver.extend({

        getNextMove: function (lastMove, validSquares) {
            this.deferred = new $.Deferred();
            this.once('cell:move', this.moveListener, this);
            _.defer(_.bind(this.computeMove, this), lastMove, validSquares);
            return this.deferred.promise();
        },

        computeMove: function (lastMove, validSquares) {
            var state = Engine.getInstance().board.getState(),
                candidates = [],
                candidate;
            // find critical moves
            _.each(validSquares, function (squareIndex) {
                var squareState = _.clone(state[squareIndex]);
                var criticalIndexes = Helper.findCriticalIndexes(squareState, 2);
                _.each(criticalIndexes, function (cellIndex) {
                    candidates.push([squareIndex, cellIndex]);
                });
            });

            if (this.fireMove(candidates)) {
                return;
            }

            // find defensive moves
            _.each(validSquares, function (squareIndex) {
                var squareState = _.clone(state[squareIndex]);
                var defensiveIndexes = Helper.findCriticalIndexes(squareState, 1);
                _.each(defensiveIndexes, function (cellIndex) {
                    candidates.push([squareIndex, cellIndex]);
                });
            });

            if (this.fireMove(candidates)) {
                return;
            }

            // get valid candidates
            _.each(validSquares, function (squareIndex) {
                var squareState = _.clone(state[squareIndex]);
                var vacancyIndexes = Helper.findVacancyIndexes(squareState);
                _.each(vacancyIndexes, function (cellIndex) {
                    candidates.push([squareIndex, cellIndex]);
                });
            });

            var dangerousIndexes = Engine.getInstance().board.getTakenSquareIndexes(1);
            var numberOfTaken = _.sortBy(Engine.getInstance().board.getNumberOfTaken(2));
            // filter stupid moves
            var risks = _.filter(risks, function (candidate) {
                return !_.contains(dangerousIndexes, candidate[0]);
            });
            // find positive moves
            _.filter(risks, function (candidate) {
                return candidate[0] === numberOfTaken[8];
            });

            if (this.fireMove(risks)) {
                return;
            }

            if (this.fireMove(candidates)) {
                return;
            }

            throw 'Not an option';
        },

        fireMove: function (candidates) {
            if (!_.isEmpty(candidates)) {
                var candidate = _.sample(candidates);
                // mimic 1-2 seconds delay
                _.delay(function () {
                    Engine.getInstance().trigger(
                        'player:move',
                        candidate[0],
                        candidate[1],
                        true);
                }, _.random(1000, 2000));
                return true;
            }
            return false;
        }

    });

    return MediumResolver;
});
