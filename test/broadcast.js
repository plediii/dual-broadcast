/*jslint node: true */
"use strict";

var assert = require('assert');

var dualproto = require('dual-protocol');
var dualapi = require('dualapi');

describe('dual-broadcast', function () {
    
    var d;
    beforeEach(function () {
        // d = (dualproto.use(require('../index')))()
        d = (dualapi.use(require('../index')))()
        d.broadcast(['b']);
    });

    it('should have listeners for subscribe', function () {
        assert.notEqual(0, d.listeners(['b', 'register', '**']).length);
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
        d.send(['b', 'register', 'client', '1']);
        d.send(['b', 'register', 'client', '2']);
        d.send(['b', 'subscribe', 'client', '1'], ['source']);
        d.send(['b', 'subscribe', 'client', '2'], ['source']);
        d.send(['b', 'send'], ['source']);
    });

    it('should *not* allow messages to unregistered hosts', function (done) {
        var onecalled = false;
        d.mount(['client', '1'], function () {
            done('unregistered host');
        });
        d.send(['b', 'subscribe', 'client', '1'], ['source']);
        d.send(['b', 'send'], ['source']);
        done();
    });

    it('should *not* send messages to unsubscribed hosts', function (done) {
        var onecalled = false;
        d.mount(['client', '1'], function () {
            done('1 called');
        });
        d.mount(['client', '2'], function () {
            done();
        });
        d.send(['b', 'register', 'client', '1']);
        d.send(['b', 'register', 'client', '2']);
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
        d.send(['b', 'register', 'client', '1']);
        d.send(['b', 'register', 'client', '2']);
        d.send(['b', 'subscribe', 'client', '1'], ['source']);
        d.send(['b', 'send'], ['source'], { symbol: 'transcode' });
    });

    it('should send options to subscribed hosts', function (done) {
        d.mount(['client', '1'], function (body, ctxt) {
            assert.deepEqual({ dial: 'home' }, ctxt.options);
            done();
        });
        d.send(['b', 'register', 'client', '1']);
        d.send(['b', 'subscribe', 'client', '1'], ['source']);
        d.send(['b', 'send'], ['source'], null, { dial: 'home' });
    });

    it('should send with message "from"', function (done) {
        d.mount(['client', '1'], function (body, ctxt) {
            assert.deepEqual(['piece', 'of', 'cacke'], ctxt.from);
            done();
        });
        d.send(['b', 'register', 'client', '1']);
        d.send(['b', 'subscribe', 'client', '1'], ['piece', 'of', 'cacke']);
        d.send(['b', 'send'], ['piece', 'of', 'cacke']);
    });

    it('should allow wild card subscriptions', function (done) {
        d.mount(['client', '1'], function (body, ctxt) {
            done();
        });
        d.send(['b', 'register', 'client', '1']);
        d.send(['b', 'subscribe', 'client', '1'], ['piece', '*', 'cacke']);
        d.send(['b', 'send'], ['piece', 'a', 'cacke']);
    });

    it('should send with message "from" even on wildcard subscription', function (done) {
        d.mount(['client', '1'], function (body, ctxt) {
            assert.deepEqual(['piece', 'a', 'cacke'], ctxt.from);
            done();
        });
        d.send(['b', 'register', 'client', '1']);
        d.send(['b', 'subscribe', 'client', '1'], ['piece', '*', 'cacke']);
        d.send(['b', 'send'], ['piece', 'a', 'cacke']);
    });

    it('should auto unsubscribe disconnecting hosts', function (done) {
        var onecalled = false;
        d.mount(['client', '1'], function () {
            done('1 called');
        });
        d.send(['b', 'register', 'client', '1']);
        d.send(['b', 'subscribe', 'client', '1'], ['source']);
        d.send(['disconnect', 'client', '1']);
        d.send(['b', 'send'], ['source']);
        done();
    });

    it('should auto unsubscribe disconnected sub hosts', function (done) {
        var onecalled = false;
        d.mount(['client', '1'], function () {
            done('1 called');
        });
        d.send(['b', 'register', 'client']);
        d.send(['b', 'subscribe', 'client', '1'], ['source']);
        d.send(['disconnect', 'client']);
        d.send(['b', 'send'], ['source']);
        done();
    });

    it('should *not* unsubscribe less particular subscriptions', function (done) {
        d.mount(['client', '1'], function (body, ctxt) {
            assert.deepEqual(['piece', 'a', 'cacke'], ctxt.from);
            done();
        });
        d.send(['b', 'register', 'client', '1']);
        d.send(['b', 'subscribe', 'client', '1'], ['piece', '*', 'cacke']);
        d.send(['b', 'unsubscribe', 'client', '1'], ['piece', 'a', 'cacke']);
        d.send(['b', 'send'], ['piece', 'a', 'cacke']);
    });
});
