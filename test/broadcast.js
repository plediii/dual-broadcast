/*jslint node: true */
"use strict";

var assert = require('assert');

var dualproto = require('dual-protocol');

describe('dual-broadcast', function () {
    
    var d, b;
    beforeEach(function () {
        // d = (dualproto.use(require('../index')))()
        d = (dualproto.use(require('../index')))()
        b = d.broadcast(['b']);
    });

    it('should respond true on successful subscriptions', function () {
        b.register(['client', '1']);
        assert(b.subscribe(['client', '1'], ['source']), 'expected truthy on successful subscription');
    });

    it('should respond false on  unsuccessful subscriptions', function () {
        assert(!b.subscribe(['client', '1'], ['source']), 'expected falsy on unsuccessful subscription');
    });

    it('should send messages to subscribed hosts', function (done) {
        var onecalled = false;
        d.mount(['client', '1'], function () {
            onecalled = true;
        });
        d.mount(['client', '2'], function () {
            assert(onecalled);
            done();
        });
        b.register(['client', '1']);
        b.register(['client', '2']);
        b.subscribe(['client', '1'], ['source']);
        b.subscribe(['client', '2'], ['source']);
        b.send(['source']);
    });

    it('should *not* allow messages to unregistered hosts', function (done) {
        var onecalled = false;
        d.mount(['client', '1'], function () {
            done('unregistered host');
        });
        b.subscribe(['client', '1'], ['source']);
        b.send(['source']);
        done();
    });

    it('should allow multiple subscriptions per client', function (done) {
        var acalled = false;
        d.mount(['client', '1'], function (body) {
            if (body === 'a') {
                assert(!acalled);
                acalled = true;
            } else if (body === 'b') {
                assert(acalled);
                done();
            } else {
                done('unexpected call ' + body);
            }
        });
        b.register(['client', '1']);
        b.subscribe(['client', '1'], ['source', 'a']);
        b.subscribe(['client', '1'], ['source', 'b']);
        b.send(['source', 'a'], 'a');
        b.send(['source', 'b'], 'b');
    });

    it('should *not* send messages to unsubscribed hosts', function (done) {
        var onecalled = false;
        d.mount(['client', '1'], function () {
            done('1 called');
        });
        d.mount(['client', '2'], function () {
            done();
        });
        b.register(['client', '1']);
        b.register(['client', '2']);
        b.subscribe(['client', '1'], ['source']);
        b.subscribe(['client', '2'], ['source']);
        b.unsubscribe(['client', '1'], ['source']);
        b.send(['source']);
    });

    it('should allow unsubscriptions for particular sources', function (done) {
        var acalled = false;
        d.mount(['client', '1'], function (body) {
            if (body === 'b') {
                done();
            } else {
                done('unexpected call ' + body);
            }
        });
        b.register(['client', '1']);
        b.subscribe(['client', '1'], ['source', 'a']);
        b.subscribe(['client', '1'], ['source', 'b']);
        b.unsubscribe(['client', '1'], ['source', 'a']);
        b.send(['source', 'a'], 'a');
        b.send(['source', 'b'], 'b');
    });

    it('should indicate send success when subscribed hosts exist', function () {
        d.mount(['client', '1'], function (body) {});
        b.register(['client', '1']);
        b.subscribe(['client', '1'], ['source']);
        assert(b.send(['source']));
    });

    it('should indicate send failure when no subscribed hosts exist', function () {
        assert(!b.send(['source']));
    });

    it('should send body to subscribed hosts', function (done) {
        d.mount(['client', '1'], function (body) {
            assert.deepEqual({ symbol: 'transcode' }, body);
            done();
        });
        b.register(['client', '1']);
        b.register(['client', '2']);
        b.subscribe(['client', '1'], ['source']);
        b.send(['source'], { symbol: 'transcode' });
    });

    it('should send options to subscribed hosts', function (done) {
        d.mount(['client', '1'], function (body, ctxt) {
            assert.deepEqual({ dial: 'home' }, ctxt.options);
            done();
        });
        b.register(['client', '1']);
        b.subscribe(['client', '1'], ['source']);
        b.send(['source'], null, { dial: 'home'});
    });

    it('should send with message "from"', function (done) {
        d.mount(['client', '1'], function (body, ctxt) {
            assert.deepEqual(['piece', 'of', 'cake'], ctxt.from);
            done();
        });
        b.register(['client', '1']);
        b.subscribe(['client', '1'], ['piece', 'of', 'cake']);
        b.send(['piece', 'of', 'cake']);
    });

    it('should allow wild card subscriptions', function (done) {
        d.mount(['client', '1'], function (body, ctxt) {
            done();
        });
        b.register(['client', '1']);
        b.subscribe(['client', '1'], ['piece', '*', 'cacke']);
        b.send(['piece', 'a', 'cacke']);
    });

    it('should send with message "from" even on wildcard subscription', function (done) {
        d.mount(['client', '1'], function (body, ctxt) {
            assert.deepEqual(['piece', 'a', 'cacke'], ctxt.from);
            done();
        });
        b.register(['client', '1']);
        b.subscribe(['client', '1'], ['piece', '*', 'cacke']);
        b.send(['piece', 'a', 'cacke']);
    });

    it('should auto unsubscribe disconnecting hosts', function (done) {
        var onecalled = false;
        d.mount(['client', '1'], function () {
            done('1 called');
        });
        b.register(['client', '1']);
        b.subscribe(['client', '1'], ['source']);
        d.send(['disconnect', 'client', '1']);
        b.send(['source']);
        done();
    });

    it('should auto unsubscribe disconnected sub hosts', function (done) {
        var onecalled = false;
        d.mount(['client', '1'], function () {
            done('1 called');
        });
        b.register(['client']);
        b.subscribe(['client', '1'], ['source']);
        d.send(['disconnect', 'client']);
        b.send(['source']);
        done();
    });

    it('should *not* unsubscribe less particular subscriptions', function (done) {
        d.mount(['client', '1'], function (body, ctxt) {
            assert.deepEqual(['piece', 'a', 'cacke'], ctxt.from);
            done();
        });
        b.register(['client', '1']);
        b.subscribe(['client', '1'], ['piece', '*', 'cacke']);
        b.unsubscribe(['client', '1'], ['piece', 'a', 'cacke']);
        b.send(['piece', 'a', 'cacke']);
    });
});
