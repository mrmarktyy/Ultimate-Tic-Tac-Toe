define(['vendor/jquery', 'vendor/lodash'], function ($, _) {
    'use strict';

    function checkRole (c) {
        if (c.length !== 9) {
            throw 'array length is not valid.';
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

    function findCriticalIndexes (c, role) {
        if (c.length !== 9) {
            throw 'array length is not valid.';
        }

        var results = [];
        function checkHorizontal () {
            for (var i = 0; i < 3; i++) {
                var _i = i * 3;
                if (c[_i].value === c[_i + 1].value &&
                    c[_i].value === role &&
                    c[_i + 2].value === 0 ) {
                    results.push(_i + 2);
                }
                if (c[_i].value === c[_i + 2].value &&
                    c[_i].value === role &&
                    c[_i + 1].value === 0) {
                    results.push(_i + 1);
                }
                if (c[_i + 1].value === c[_i + 2].value &&
                    c[_i + 1].value === role &&
                    c[_i].value === 0) {
                    results.push(_i);
                }
            }
        }

        function checkVertical () {
            for (var i = 0; i < 3; i++) {
                var _i = i;
                if (c[_i].value === c[_i + 3].value &&
                    c[_i].value === role &&
                    c[_i + 6].value === 0 ) {
                    results.push(_i + 6);
                }
                if (c[_i].value === c[_i + 6].value &&
                    c[_i].value === role &&
                    c[_i + 3].value === 0) {
                    results.push(_i + 3);
                }
                if (c[_i + 3].value === c[_i + 6].value &&
                    c[_i + 3].value === role &&
                    c[_i].value === 0) {
                    results.push(_i);
                }
            }
        }

        function checkDiagonal () {
            if (c[0].value === c[4].value &&
                c[0].value === role &&
                c[8].value === 0) {
                results.push(8);
            }
            if (c[0].value === c[8].value &&
                c[0].value === role &&
                c[4].value === 0) {
                results.push(4);
            }
            if (c[4].value === c[8].value &&
                c[4].value === role &&
                c[0].value === 0) {
                results.push(0);
            }
            if (c[2].value === c[4].value &&
                c[2].value === role &&
                c[6].value === 0) {
                results.push(6);
            }
            if (c[2].value === c[6].value &&
                c[2].value === role &&
                c[4].value === 0) {
                results.push(4);
            }
            if (c[4].value === c[6].value &&
                c[4].value === role &&
                c[2].value === 0) {
                results.push(2);
            }
        }

        checkHorizontal();
        checkVertical();
        checkDiagonal();
        return _.uniq(results);
    }

    function findVacancyIndexes (c) {
        return _.compact(_.map(c,
            function (o, index) {
                if (o.value === 0) {
                    return index;
                }
            })
        );
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

    function getInitialState () {
        var state = [];
        for (var i = 0; i < 9; i++) {
            state.push([{},{},{},{},{},{},{},{},{}]);
        }
        return state;
    }

    function pad (n) {
        return n < 10 ? ('0' + n) : n;
    }

    function escape (str) {
        if (window.escape) {
            return window.escape(str);
        }
        return $('<div>').text(str).html();
    }

    return {
        checkRole           : checkRole,
        getQueryParams      : getQueryParams,
        getInitialState     : getInitialState,
        pad                 : pad,
        escape              : escape,
        findCriticalIndexes : findCriticalIndexes,
        findVacancyIndexes  : findVacancyIndexes
    };

});
