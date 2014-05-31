define(['resolvers/human', 'resolvers/computer', 'models/player'], function (HumanResolver, ComputerResolver, Player) {
    'use strict';

    var MODE = {
        HUMAN: 'human',
        COMPUTER: 'computer'
    };

    function getResolver (player) {
        switch (player.get('mode')) {
        case MODE.HUMAN:
            return new HumanResolver(player);
        case MODE.COMPUTER:
            return new ComputerResolver(player);
        }
    }

    return {
        getResolver: getResolver
    };

});
