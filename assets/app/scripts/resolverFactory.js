define(['resolvers/local', 'resolvers/computer', 'resolvers/remote'],
function (LocalResolver, ComputerResolver, RemoteResolver) {
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
            return new ComputerResolver(player);
        }
    }

    return {
        getResolver: getResolver
    };

});
