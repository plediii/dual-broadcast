/*jslint node: true */
"use strict";


var dualproto = require('dual-protocol');

describe('dual-broadcast', function () {
    
    var d;
    beforeEach(function () {
        d = (dualproto.use(require('../index')))()
        d.broadcast(['b']);
    });

    describe('unsubscribe', function () { 
        it('should send removeListner messages on unsubscribe', function (done) {
            var onecalled = false;
            d.mount(['b', 'removeListener', '**'], function () {
                done();
            });
            d.send(['b', 'subscribe', 'client', '1'], ['source']);
            d.send(['b', 'unsubscribe', 'client', '1'], ['source']);
        });

        it('should include subscriber address in destination ', function (done) {
            var onecalled = false;
            d.mount(['b', 'removeListener', '::subscriber'], function (body, ctxt) {
                assert.deepEqual(['client', '1'], ctxt.params.subscriber);
                done();
            });
            d.send(['b', 'subscribe', 'client', '1'], ['source']);
            d.send(['b', 'unsubscribe', 'client', '1'], ['source']);
        });

        // it('should include exact subscriber address in body ', function (done) {
        //     var onecalled = false;
        //     d.mount(['b', 'removeListener', '::subscriber'], function (body, ctxt) {
        //         assert.deepEqual(['client', '1'], body);
        //         done();
        //     });
        //     d.send(['b', 'subscribe', 'client', '1'], ['source']);
        // });

        it('should include subscription address in source ', function (done) {
            var onecalled = false;
            d.mount(['b', 'removeListener', '**'], function (body, ctxt) {
                assert.deepEqual(['source', 'a'], ctxt.from);
                done();
            });
            d.send(['b', 'unsubscribe', 'client', '1'], ['source', 'a']);
        });
    });

    describe('disconnect', function () {
        it('should send removeListner messages on disconnect', function (done) {
            var onecalled = false;
            d.mount(['b', 'removeListener', '**'], function () {
                done();
            });
            d.send(['b', 'subscribe', 'client', '1'], ['source']);
            d.send(['disconnect', 'client', '1']);
        });

        it('should include subscriber address in destination ', function (done) {
            var onecalled = false;
            d.mount(['b', 'removeListener', '::subscriber'], function (body, ctxt) {
                assert.deepEqual(['client', '1'], ctxt.params.subscriber);
                done();
            });
            d.send(['b', 'subscribe', 'client', '1'], ['source']);
            d.send(['disconnect', 'client', '1']);
        });

        // it('should include exact subscriber address in body ', function (done) {
        //     var onecalled = false;
        //     d.mount(['b', 'removeListener', '::subscriber'], function (body, ctxt) {
        //         assert.deepEqual(['client', '1'], body);
        //         done();
        //     });
        //     d.send(['b', 'subscribe', 'client', '1'], ['source']);
        // });

        it('should include subscription address in source ', function (done) {
            var onecalled = false;
            d.mount(['b', 'removeListener', '**'], function (body, ctxt) {
                assert.deepEqual(['source', 'a'], ctxt.from);
                done();
            });
            d.send(['disconnect', 'client', '1']);
        });
    });
});
