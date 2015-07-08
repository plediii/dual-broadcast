/*jslint node: true */
"use strict";

var assert = require('assert');

var dualproto = require('dual-protocol');

describe('dual-broadcast autoregister', function () {
    
    var d;
    beforeEach(function () {
        // d = (dualproto.use(require('../index')))()
        d = (dualproto.use(require('../index')))()
        d.broadcast(['b']);
    });

    it('should be a mounted host', function () {
        assert.notEqual(0, d.listeners(['b', 'autoregister', '**']).length);
    });

    it('should auto register provided hosts', function (done) {
        d.mount(['client', '1'], function () {
            done();
        });
        d.send(['b', 'autoregister', 'client', '*']);
        d.send(['connect', 'client', '1']);
        d.send(['b', 'subscribe', 'client', '1'], ['source']);
        d.send(['b', 'send'], ['source']);
    });

    it('should not auto register unconnected hosts', function (done) {
        d.mount(['client', '2'], function () {
            done('subscribed unconnected host');
        });
        d.send(['b', 'autoregister', 'client', '*']);
        d.send(['connect', 'client', '1']);
        d.send(['b', 'subscribe', 'client', '2'], ['source']);
        d.send(['b', 'send'], ['source']);
        done();
    });
});
