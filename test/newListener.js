/*jslint node: true */
"use strict";

var assert = require('assert');

var dualproto = require('dual-protocol');

describe('dual-broadcast newListener', function () {
    
    var d, b;
    beforeEach(function () {
        d = (dualproto.use(require('../index')))()
        b = d.broadcast(['b']);
    });

    it('should send newListener messages on subscriptions', function (done) {
        d.mount(['b', 'newListener'], function () {
            done();
        });
        b.register(['client', '1']);
        b.subscribe(['client', '1'], ['source']);
    });

    it('should send newListener messages after mounting subscriber', function (done) {
        d.mount(['client', '1'], function () {
            done();
        });
        d.mount(['b', 'newListener'], function () {
            d.send(['b', 'send'], ['source']);
        });
        b.register(['client', '1']);
        b.subscribe(['client', '1'], ['source']);
    });


    it('should include subscription address in source ', function (done) {
        d.mount(['b', 'newListener', '::subscription'], function (body, ctxt) {
            assert.deepEqual(['source'], ctxt.from);
            done();
        });
        b.register(['client', '1']);
        b.subscribe(['client', '1'], ['source']);
    });

    it('should include subscription address in destination ', function (done) {
        d.mount(['b', 'newListener', '::subscription'], function (body, ctxt) {
            assert.deepEqual(['source'], ctxt.params.subscription);
            done();
        });
        b.register(['client', '1']);
        b.subscribe(['client', '1'], ['source']);
    });

    it('should include subscriber address as body ', function (done) {
        d.mount(['b', 'newListener', '::subscription'], function (body, ctxt) {
            assert.deepEqual(['client', '1'], body);
            done();
        });
        b.register(['client', '1']);
        b.subscribe(['client', '1'], ['source']);
    });

    it('should include subscription address in source ', function (done) {
        var onecalled = false;
        d.mount(['b', 'newListener', '**'], function (body, ctxt) {
            assert.deepEqual(['source', 'a'], ctxt.from);
            done();
        });
        b.register(['client', '1']);
        b.subscribe(['client', '1'], ['source', 'a']);
    });
});

