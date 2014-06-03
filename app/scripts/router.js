define(['vendor/backbone'], function (Backbone) {
    'use strict';

    return Backbone.Router.extend({
        routes: {
            ''              : 'home',
            'single'        : 'single',
            'single/human'  : 'human',
            'single/easy'   : 'easy',
            'single/medium' : 'medium',
            'single/hard'   : 'hard',
            'online'        : 'online',
            'tutorial'      : 'tutorial',
            'about'         : 'about'
        },

        initialize: function () {

        }

    });

});
