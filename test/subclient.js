/*jslint node: true */
"use strict";

var assert = require('assert');

var dualproto = require('dual-protocol');

describe('dual-broadcast subroutes', function () {
    
    var d;
    beforeEach(function () {
        d = (dualproto.use(require('../index')))()
        d.broadcast(['b']);
    });
    
    it('should allow subscriptions to subroutes of registered clients', function (done) {
        d.mount(['client', 'a', 'subhost'], function () {
            done();
        });
        d.send(['b', 'register', 'client', 'a']);
        d.send(['b', 'subscribe', 'client', 'a', 'subhost'], ['source']);
        d.send(['b', 'send'], ['source']);
    });
    
    it('should allow unsubscribing subroutes of registered clients', function (done) {
        d.mount(['client', 'a', 'subhost'], function () {
            done('unsubscribed client was called');
        });
        d.send(['b', 'register', 'client', 'a']);
        d.send(['b', 'subscribe', 'client', 'a', 'subhost'], ['source']);
        d.send(['b', 'unsubscribe', 'client', 'a', 'subhost'], ['source']);
        d.send(['b', 'send'], ['source']);
        done();
    });

});
