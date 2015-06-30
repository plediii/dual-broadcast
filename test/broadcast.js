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

    it('should have listeners for subscribe', function () {
        assert.notEqual(0, d.listeners(['b', 'subscribe', '**']).length);
    });

    it('should have listeners for send', function () {
        assert.notEqual(0, d.listeners(['b', 'send']).length);
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
        d.send(['b', 'subscribe', 'client', '1'], ['source']);
        d.send(['b', 'subscribe', 'client', '2'], ['source']);
        d.send(['b', 'send'], ['source']);
    });

    it('should *not* send messages to unsubscribed hosts', function (done) {
        var onecalled = false;
        d.mount(['client', '1'], function () {
            done('1 called');
        });
        d.mount(['client', '2'], function () {
            done();
        });
        d.send(['b', 'subscribe', 'client', '1'], ['source']);
        d.send(['b', 'subscribe', 'client', '2'], ['source']);
        d.send(['b', 'unsubscribe', 'client', '1'], ['source']);
        d.send(['b', 'send'], ['source']);
    });

    it('should send body to subscribed hosts', function (done) {
        d.mount(['client', '1'], function (body) {
            assert.deepEqual({ symbol: 'transcode' }, body);
            done();
        });
        d.send(['b', 'subscribe', 'client', '1'], ['source']);
        d.send(['b', 'send'], ['source'], { symbol: transcode });
    });

    it('should send options to subscribed hosts', function (done) {
        d.mount(['client', '1'], function (body, ctxt) {
            assert.deepEqual({ dial: 'home' }, ctxt.options);
            done();
        });
        d.send(['b', 'subscribe', 'client', '1'], ['source']);
        d.send(['b', 'send'], ['source'], null, { dial: 'home' });
    });

    it('should send with message "from"', function (done) {
        d.mount(['client', '1'], function (body, ctxt) {
            assert.deepEqual(['piece', 'of', 'cacke'], ctxt.from);
            done();
        });
        d.send(['b', 'subscribe', 'client', '1'], ['piece', 'of', 'cacke']);
        d.send(['b', 'send'], ['piece', 'of', 'cacke']);
    });

    it('should allow wild card subscriptions', function (done) {
        var onecalled = false;
        d.mount(['client', '1'], function () {
            onecalled = true;
        });
        d.mount(['client', '2'], function () {
            assert(onecalled);
            done();
        });
        d.send(['b', 'subscribe', 'client', '*'], ['source']);
        d.send(['b', 'send'], ['source']);
    });

    it('should send with message "from" even on wildcard subscription', function (done) {
        d.mount(['client', '1'], function (body, ctxt) {
            assert.deepEqual(['piece', 'a', 'cacke'], ctxt.from);
            done();
        });
        d.send(['b', 'subscribe', 'client', '1'], ['piece', '*', 'cacke']);
        d.send(['b', 'send'], ['piece', 'a', 'cacke']);
    });

    it('should auto unsubscribe disconnecting hosts', function (done) {
        var onecalled = false;
        d.mount(['client', '1'], function () {
            done('1 called');
        });
        d.send(['b', 'subscribe', 'client', '1'], ['source']);
        d.send(['disconnect', 'client', '1']);
        d.send(['b', 'send'], ['source']);
        done();
    });

    it('should *not* unsubscribe less particular clients from wild card subscriptions', function (done) {
        var onecalled = false;
        d.mount(['client', '2'], function () {
            done();
        });
        d.send(['b', 'subscribe', 'client', '*'], ['source']);
        d.send(['b', 'unsubscribe', 'client', '1'], ['source']);
        d.send(['b', 'send'], ['source']);
    });

    it('should *not* unsubscribe less particular clients from wild card subscriptions on disconnect', function (done) {
        var onecalled = false;
        d.mount(['client', '2'], function () {
            done();
        });
        d.send(['b', 'subscribe', 'client', '*'], ['source']);
        d.send(['disconnect', 'client', '1'], ['source']);
        d.send(['b', 'send'], ['source']);
    });
});
