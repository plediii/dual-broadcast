/*jslint node: true */
"use strict";


var dualproto = require('dual-protocol');

describe('dual-broadcast', function () {
    
    var d;
    beforeEach(function () {
        var api = ;
        d = (dualproto.use(require('../index')))()
        d.broadcast(['b']);
    });

    it('should send newListener messages on subscriptions', function (done) {
        var onecalled = false;
        d.mount(['b', 'newListener', '**'], function () {
            done();
        });
        d.send(['b', 'subscribe', 'client', '1'], ['source']);
    });

    it('should include subscriber address in destination ', function (done) {
        var onecalled = false;
        d.mount(['b', 'newListener', '::subscriber'], function (body, ctxt) {
            assert.deepEqual(['client', '1'], ctxt.params.subscriber);
            done();
        });
        d.send(['b', 'subscribe', 'client', '1'], ['source']);
    });

    // it('should include exact subscriber address in body ', function (done) {
    //     var onecalled = false;
    //     d.mount(['b', 'newListener', '::subscriber'], function (body, ctxt) {
    //         assert.deepEqual(['client', '1'], body);
    //         done();
    //     });
    //     d.send(['b', 'subscribe', 'client', '1'], ['source']);
    // });

    it('should include subscription address in source ', function (done) {
        var onecalled = false;
        d.mount(['b', 'newListener', '**'], function (body, ctxt) {
            assert.deepEqual(['source', 'a'], ctxt.from);
            done();
        });
        d.send(['b', 'subscribe', 'client', '1'], ['source', 'a']);
    });
});
