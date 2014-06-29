define(function () {
    'use strict';

    var storage = window.localStorage;

    function get (key) {
        if (!storage) {
            return undefined;
        }
        return storage.getItem(key);
    }

    function set (key, value) {
        if (!storage) {
            return undefined;
        }
        return storage.setItem(key, value);
    }

    function remove (key) {
        if (storage) {
            storage.removeItem(key);
        }
    }

    return {
        get     : get,
        set     : set,
        remove  : remove
    };
});
