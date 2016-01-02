/*jslint node: true */
"use strict";

var assert = require('assert');

var dualproto = require('dual-protocol');

describe('dual-broadcast subroutes', function () {
    
    var d, b;
    beforeEach(function () {
        d = (dualproto.use(require('../index')))()
        b = d.broadcast(['b']);
    });
    
    it('should allow subscriptions to subroutes of registered clients', function (done) {
        d.mount(['client', 'a', 'subhost'], function () {
            done();
        });
        b.register(['client', 'a']);
        b.subscribe(['client', 'a', 'subhost'], ['source']);
        b.send(['source']);
    });
    
    it('should allow unsubscribing subroutes of registered clients', function (done) {
        d.mount(['client', 'a', 'subhost'], function () {
            done('unsubscribed client was called');
        });
        b.register(['client', 'a']);
        b.subscribe(['client', 'a', 'subhost'], ['source']);
        b.unsubscribe(['client', 'a', 'subhost'], ['source']);
        b.send(['source']);
        done();
    });

    it('should emit newlistener events when subscribing sub clients', function (done) {
        d.mount(['b', 'newListener'], function () {
            done();
        });
        b.register(['client', 'a']);
        b.subscribe(['client', 'a', 'subhost'], ['source']);
        b.send(['source']);
    });

    it('should include subclient as body of newListener event', function (done) {
        d.mount(['b', 'newListener'], function (body) {
            assert.deepEqual(['client', 'a', 'subhost'], body);
            done();
        });
        b.register(['client', 'a']);
        b.subscribe(['client', 'a', 'subhost'], ['source']);
        b.send(['source']);
    });

    it('should emit removeListener events when unsubscribing sub clients', function (done) {
        d.mount(['b', 'removeListener'], function () {
            done();
        });
        b.register(['client', 'a']);
        b.subscribe(['client', 'a', 'subhost'], ['source']);
        b.unsubscribe(['client', 'a', 'subhost'], ['source']);
    });

    it('should emit removeListener events with subscription in destination when unsubscribing sub clients', function (done) {
        d.mount(['b', 'removeListener', '::subscription'], function (body, ctxt) {
            assert.deepEqual(['source'], ctxt.params.subscription)
            done();
        });
        b.register(['client', 'a']);
        b.subscribe(['client', 'a', 'subhost'], ['source']);
        b.unsubscribe(['client', 'a', 'subhost'], ['source']);
    });

    it('should emit removeListener events with subscriber as body when unsubscribing sub clients', function (done) {
        d.mount(['b', 'removeListener', '::subscription'], function (body, ctxt) {
            assert.deepEqual(['client', 'a', 'subhost'], body)
            done();
        });
        b.register(['client', 'a']);
        b.subscribe(['client', 'a', 'subhost'], ['source']);
        b.unsubscribe(['client', 'a', 'subhost'], ['source']);
    });

});
