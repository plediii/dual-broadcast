/*jslint node: true */
"use strict";

var assert = require('assert');

var dualproto = require('dual-protocol');

describe('dual-broadcast removeListener', function () {
    
    var d;
    beforeEach(function () {
        d = (dualproto.use(require('../index')))()
        d.broadcast(['b']);
    });

    describe('unsubscribe', function () { 
        it('should send removeListner messages on unsubscribe', function (done) {
            d.mount(['b', 'removeListener'], function () {
                done();
            });
            d.send(['b', 'register', 'client', '1']);
            d.send(['b', 'subscribe', 'client', '1'], ['source']);
            d.send(['b', 'unsubscribe', 'client', '1'], ['source']);
        });

        it('should include subscription address in destination ', function (done) {
            d.mount(['b', 'removeListener', '::subscription'], function (body, ctxt) {
                assert.deepEqual(['source'], ctxt.params.subscription);
                done();
            });
            d.send(['b', 'register', 'client', '1']);
            d.send(['b', 'subscribe', 'client', '1'], ['source']);
            d.send(['b', 'unsubscribe', 'client', '1'], ['source']);
        });

        it('should include subscriber address in body', function (done) {
            d.mount(['b', 'removeListener', '::subscription'], function (body, ctxt) {
                assert.deepEqual(['client', '1'], body);
                done();
            });
            d.send(['b', 'register', 'client', '1']);
            d.send(['b', 'subscribe', 'client', '1'], ['source']);
            d.send(['b', 'unsubscribe', 'client', '1'], ['source']);
        });

        it('should include subscription address in source ', function (done) {
            d.mount(['b', 'removeListener', '**'], function (body, ctxt) {
                assert.deepEqual(['source', 'a'], ctxt.from);
                done();
            });
            d.send(['b', 'register', 'client', '1']);
            d.send(['b', 'subscribe', 'client', '1'], ['source', 'a']);
            d.send(['b', 'unsubscribe', 'client', '1'], ['source', 'a']);
        });
    });

    describe('disconnect', function () {
        it('should send removeListner messages on disconnect', function (done) {
            d.mount(['b', 'removeListener', '**'], function () {
                done();
            });
            d.send(['b', 'register', 'client', '1']);
            d.send(['b', 'subscribe', 'client', '1'], ['source']);
            d.send(['disconnect', 'client', '1']);
        });

        it('should include subscription address in destination ', function (done) {
            d.mount(['b', 'removeListener', '::subscription'], function (body, ctxt) {
                assert.deepEqual(['source'], ctxt.params.subscription);
                done();
            });
            d.send(['b', 'register', 'client', '1']);
            d.send(['b', 'subscribe', 'client', '1'], ['source']);
            d.send(['disconnect', 'client', '1']);
        });

        it('should include subscriber address in body ', function (done) {
            d.mount(['b', 'removeListener', '::subscription'], function (body, ctxt) {
                assert.deepEqual(['client', '1'], body);
                done();
            });
            d.send(['b', 'register', 'client', '1']);
            d.send(['b', 'subscribe', 'client', '1'], ['source']);
            d.send(['disconnect', 'client', '1']);
        });
    });
});
