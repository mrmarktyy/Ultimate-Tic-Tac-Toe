define(['resolvers/local', 'resolvers/remote', 'resolvers/easy', 'resolvers/medium'],
function (LocalResolver, RemoteResolver, EasyrResolver, MediumResolver) {
    'use strict';

    var MODE = {
        HUMAN: 'human',
        COMPUTER: 'computer'
    };

    function getResolver (player) {
        switch (player.get('mode')) {
        case MODE.HUMAN:
            if (player.get('type') === 'remote') {
                return new RemoteResolver(player);
            }
            return new LocalResolver(player);
        case MODE.COMPUTER:
            var difficulty = player.get('difficulty');
            if (difficulty === 'easy') {
                return new EasyrResolver(player);
            } else if (difficulty === 'medium') {
                return new MediumResolver(player);
            } else {
                throw 'Invalid computer difficulty: ' + difficulty;
            }
        }
    }

    return {
        getResolver: getResolver
    };

});
