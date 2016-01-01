/*jslint node: true */
"use strict";

var assert = require('assert');

var dualproto = require('dual-protocol');

describe('dual-broadcast autoregister', function () {
    
    var d, b;
    beforeEach(function () {
        // d = (dualproto.use(require('../index')))()
        d = (dualproto.use(require('../index')))()
        b = d.broadcast(['b']);
    });

    it('should auto register provided hosts', function (done) {
        d.mount(['client', '1'], function () {
            done();
        });
        b.autoregister(['client', '*']);
        d.send(['connect', 'client', '1']);
        b.subscribe(['client', '1'], ['source']);
        b.send(['source']);
        d.send(['b', 'send'], ['source']);
    });

    it('should not auto register unconnected hosts', function (done) {
        d.mount(['client', '2'], function () {
            done('subscribed unconnected host');
        });
        b.autoregister(['client', '*']);
        d.send(['connect', 'client', '1']);
        b.subscribe(['client', '2'], ['source']);
        b.send(['source']);
        done();
    });
});
