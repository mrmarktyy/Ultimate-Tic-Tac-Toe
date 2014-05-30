define(['resolvers/human', 'resolvers/computer', 'models/player'], function (HumanResolver, ComputerResolver, Player) {
    'use strict';

    var MODE = Player.MODE;

    function getResolver (mode) {
        switch (mode) {
        case MODE.HUMAN:
            return new HumanResolver();
        case MODE.COMPUTER:
            return new ComputerResolver();
        }
    }

    return {
        getResolver: getResolver
    };

});
