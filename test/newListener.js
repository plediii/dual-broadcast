/*jslint node: true */
"use strict";

var assert = require('assert');

var dualproto = require('dual-protocol');

describe('dual-broadcast newListener', function () {
    
    var d;
    beforeEach(function () {
        d = (dualproto.use(require('../index')))()
        d.broadcast(['b']);
    });

    it('should send newListener messages on subscriptions', function (done) {
        d.mount(['b', 'newListener'], function () {
            done();
        });
        d.send(['b', 'register', 'client', '1']);
        d.send(['b', 'subscribe', 'client', '1'], ['source']);
    });

    it('should send newListener messages after mounting subscriber', function (done) {
        d.mount(['client', '1'], function () {
            done();
        });
        d.mount(['b', 'newListener'], function () {
            d.send(['b', 'send'], ['source']);
        });
        d.send(['b', 'register', 'client', '1']);
        d.send(['b', 'subscribe', 'client', '1'], ['source']);
    });


    it('should include subscription address in source ', function (done) {
        d.mount(['b', 'newListener', '::subscription'], function (body, ctxt) {
            assert.deepEqual(['source'], ctxt.from);
            done();
        });
        d.send(['b', 'register', 'client', '1']);
        d.send(['b', 'subscribe', 'client', '1'], ['source']);
    });

    it('should include subscription address in destination ', function (done) {
        d.mount(['b', 'newListener', '::subscription'], function (body, ctxt) {
            assert.deepEqual(['source'], ctxt.params.subscription);
            done();
        });
        d.send(['b', 'register', 'client', '1']);
        d.send(['b', 'subscribe', 'client', '1'], ['source']);
    });

    it('should include subscriber address as body ', function (done) {
        d.mount(['b', 'newListener', '::subscription'], function (body, ctxt) {
            assert.deepEqual(['client', '1'], body);
            done();
        });
        d.send(['b', 'register', 'client', '1']);
        d.send(['b', 'subscribe', 'client', '1'], ['source']);
    });

    it('should include subscription address in source ', function (done) {
        var onecalled = false;
        d.mount(['b', 'newListener', '**'], function (body, ctxt) {
            assert.deepEqual(['source', 'a'], ctxt.from);
            done();
        });
        d.send(['b', 'register', 'client', '1']);
        d.send(['b', 'subscribe', 'client', '1'], ['source', 'a']);
    });
});
