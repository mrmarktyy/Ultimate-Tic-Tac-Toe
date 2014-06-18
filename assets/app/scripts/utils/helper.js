define(['vendor/lodash'], function (_) {
    'use strict';

    function checkRole (c) {

        if (c.length !== 9) {
            throw 'collection length is not valid.';
        }

        function checkHorizontal () {
            if (c[0].value === c[1].value &&
                c[0].value === c[2].value &&
                c[1].value === c[2].value &&
                c[0].value !== 0) {
                return c[0].value;
            }
            if (c[3].value === c[4].value &&
                c[3].value === c[5].value &&
                c[4].value === c[5].value &&
                c[3].value !== 0) {
                return c[3].value;
            }
            if (c[6].value === c[7].value &&
                c[6].value === c[8].value &&
                c[7].value === c[8].value &&
                c[6].value !== 0) {
                return c[6].value;
            }
            return 0;
        }

        function checkVertical () {
            if (c[0].value === c[3].value &&
                c[0].value === c[6].value &&
                c[3].value === c[6].value &&
                c[0].value !== 0) {
                return c[0].value;
            }
            if (c[1].value === c[4].value &&
                c[1].value === c[7].value &&
                c[4].value === c[7].value &&
                c[1].value !== 0) {
                return c[1].value;
            }
            if (c[2].value === c[5].value &&
                c[2].value === c[8].value &&
                c[5].value === c[8].value &&
                c[2].value !== 0) {
                return c[2].value;
            }
            return 0;
        }

        function checkDiagonal () {
            if (c[0].value === c[4].value &&
                c[0].value === c[8].value &&
                c[4].value === c[8].value &&
                c[0].value !== 0) {
                return c[0].value;
            }
            if (c[2].value === c[4].value &&
                c[2].value === c[6].value &&
                c[4].value === c[6].value &&
                c[2].value !== 0) {
                return c[2].value;
            }
            return 0;
        }

        return checkHorizontal() || checkVertical() || checkDiagonal();
    }

    function getQueryParams (queryString) {
        return _.chain(queryString.split('&'))
            .map(function(params) {
                var p = params.split('=');
                return [p[0], decodeURIComponent(p[1])];
            })
            .object()
            .value();
    }

    function getEmptyState () {
        var state = [];
        for (var i = 0; i < 9; i++) {
            state.push([{},{},{},{},{},{},{},{},{}]);
        }
        return state;
    }

    function pad (n) {
        return n < 10 ? ('0' + n) : n;
    }

    return {
        checkRole       : checkRole,
        getQueryParams  : getQueryParams,
        getEmptyState   : getEmptyState,
        pad             : pad
    };

});
