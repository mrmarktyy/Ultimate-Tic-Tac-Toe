define(['resolvers/human', 'resolvers/computer', 'resolvers/online'],
function (HumanResolver, ComputerResolver, OnlineResolver) {
    'use strict';

    var MODE = {
        HUMAN: 'human',
        COMPUTER: 'computer'
    };

    function getResolver (player) {
        switch (player.get('mode')) {
        case MODE.HUMAN:
            if (player.get('type') === 'remote') {
                return new OnlineResolver(player);
            }
            return new HumanResolver(player);
        case MODE.COMPUTER:
            return new ComputerResolver(player);
        }
    }

    return {
        getResolver: getResolver
    };

});
