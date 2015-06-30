/*jslint node: true */
"use strict";

var assert = require('assert');

var dualproto = require('dual-protocol');

describe('dual-broadcast', function () {
    
    var d;
    beforeEach(function () {
        d = (dualproto.use(require('../index')))()
    });

    it('should listen on "broadcast" by default', function () {
        d.broadcast();
        assert.notEqual(0, d.listeners(['broadcast', 'subscribe', '**']).length);
    });

    it('should listen on provided route if provided', function () {
        d.broadcast(['c']);
        assert.notEqual(0, d.listeners(['c', 'subscribe', '**']).length);
    });
});
