/*jslint node: true */
"use strict";

var assert = require('assert');

var dualproto = require('dual-protocol');

describe('dual-broadcast removeListener', function () {
    
    var d, b;
    beforeEach(function () {
        d = (dualproto.use(require('../index')))()
        b = d.broadcast(['b']);
    });

    describe('unsubscribe', function () { 
        it('should send removeListner messages on unsubscribe', function (done) {
            d.mount(['b', 'removeListener'], function () {
                done();
            });
            b.register(['client', '1']);
            b.subscribe(['client', '1'], ['source']);
            b.unsubscribe(['client', '1'], ['source']);
        });

        it('should send removeListner messages after removing subscription', function (done) {
            d.mount(['client', '1'], function () {
                done('emitted unsubscribed event');
            });
            d.mount(['b', 'removeListener'], function () {
                d.send(['b', 'send'], ['source']);
                done();
            });
            b.register(['client', '1']);
            b.subscribe(['client', '1'], ['source']);
            b.unsubscribe(['client', '1'], ['source']);
        });

        it('should include subscription address in destination ', function (done) {
            d.mount(['b', 'removeListener', '::subscription'], function (body, ctxt) {
                assert.deepEqual(['source'], ctxt.params.subscription);
                done();
            });
            b.register(['client', '1']);
            b.subscribe(['client', '1'], ['source']);
            b.unsubscribe(['client', '1'], ['source']);
        });

        it('should include subscriber address in body', function (done) {
            d.mount(['b', 'removeListener', '::subscription'], function (body, ctxt) {
                assert.deepEqual(['client', '1'], body);
                done();
            });
            b.register(['client', '1']);
            b.subscribe(['client', '1'], ['source']);
            b.unsubscribe(['client', '1'], ['source']);
        });

        it('should include subscription address in source ', function (done) {
            d.mount(['b', 'removeListener', '**'], function (body, ctxt) {
                assert.deepEqual(['source', 'a'], ctxt.from);
                done();
            });
            b.register(['client', '1']);
            b.subscribe(['client', '1'], ['source', 'a']);
            b.unsubscribe(['client', '1'], ['source', 'a']);
        });
    });

    describe('disconnect', function () {
        it('should send removeListner messages on disconnect', function (done) {
            d.mount(['b', 'removeListener', '**'], function () {
                done();
            });
            b.register(['client', '1']);
            b.subscribe(['client', '1'], ['source']);
            d.send(['disconnect', 'client', '1']);
        });

        it('should include subscription address in destination ', function (done) {
            d.mount(['b', 'removeListener', '::subscription'], function (body, ctxt) {
                assert.deepEqual(['source'], ctxt.params.subscription);
                done();
            });
            b.register(['client', '1']);
            b.subscribe(['client', '1'], ['source']);
            d.send(['disconnect', 'client', '1']);
        });

        it('should include subscriber address in body ', function (done) {
            d.mount(['b', 'removeListener', '::subscription'], function (body, ctxt) {
                assert.deepEqual(['client', '1'], body);
                done();
            });
            b.register(['client', '1']);
            b.subscribe(['client', '1'], ['source']);
            d.send(['disconnect', 'client', '1']);
        });
    });
});
