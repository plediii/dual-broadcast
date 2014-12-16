/*jslint node: true */
"use strict";

var broadcast = require('../index');
var assert = require('assert');

describe('dual broadcast', function () {

    it('should allow adding subscriptions to registered clients', function (done) {
        var b = broadcast();
        b.mount(['client', 'cause'], function (msg) {
            assert.deepEqual(msg.from, ['effect']);
            assert.equal(msg.body, 'ship');
        });
        b.mount(['client', 'six'], function (msg) {
            assert.equal(msg.body, 'ship');
            assert.deepEqual(msg.from, ['effect']);
            done();
        });
        b.send(['broadcast', 'register', 'client', 'cause']);
        b.send(['broadcast', 'register', 'client', 'six']);
        b.send(['broadcast', 'subscribe', 'client', 'cause'], ['effect']);
        b.send(['broadcast', 'subscribe', 'client', 'six'], ['effect']);
        b.send(['broadcast', 'send'], ['effect'], 'ship');
    });

    it('should preseve from address on wildcard subscriptions', function (done) {
        var b = broadcast();
        b.mount(['client', 'wolf'], function (msg) {
            assert.deepEqual(msg.from, ['wallstreet', 'words']);
            done();
        });
        b.send(['broadcast', 'register', 'client', 'wolf']);
        b.send(['broadcast', 'subscribe', 'client', 'wolf'], ['wallstreet', '**']);
        b.send(['broadcast', 'send'], ['wallstreet', 'words'], 'everbody');
    });

    it('should allow unsubscribing registered clients', function (done) {
        var b = broadcast();
        b.mount(['client', 'cause'], function (msg) {
            done(true);
        });
        b.mount(['client', 'six'], function (msg) {
            assert.deepEqual(msg.from, ['effect']);
            assert.equal(msg.body, 'ship');
            done();
        });
        b.send(['broadcast', 'register', 'client', 'cause']);
        b.send(['broadcast', 'register', 'client', 'six']);
        b.send(['broadcast', 'subscribe', 'client', 'cause'], ['effect']);
        b.send(['broadcast', 'subscribe', 'client', 'six'], ['effect']);
        b.send(['broadcast', 'unsubscribe', 'client', 'cause'], ['effect']);
        b.send(['broadcast', 'send'], ['effect'], 'ship');
    });

    it('should allow sending to subroutes of clients', function (done) {
        var b = broadcast();
        b.mount(['client', 'inner'], function (msg) {
            done(true);
        });
        b.mount(['client', 'inner', 'ear'], function (msg) {
            assert.deepEqual(msg.from, ['have']);
            assert.equal(msg.body, 'discussion');
            done();
        });
        b.send(['broadcast', 'register', 'client', 'inner']);
        b.send(['broadcast', 'subscribe', 'client', 'inner', 'ear'], ['have']);
        b.send(['broadcast', 'send'], ['have'], 'discussion');
    });

    it('should allow disconnecting registered clients from all subscriptions', function (done) {

        var b = broadcast();
        b.mount(['client', 'last', 'monday'], function (msg) {
            done(true);
        });
        b.mount(['client', 'nih'], function (msg) {
            assert.deepEqual(msg.from, ['hunch']);
            assert.equal(msg.body, 'catwalk');
            done();
        });
        b.send(['broadcast', 'register', 'client', 'nih']);
        b.send(['broadcast', 'register', 'client', 'last']);
        b.send(['broadcast', 'subscribe', 'client', 'last', 'monday'], ['hunch']);
        b.send(['broadcast', 'subscribe', 'client', 'nih'], ['hunch']);
        b.send(['disconnect', 'client', 'last']);
        b.send(['broadcast', 'send'], ['hunch'], 'catwalk');
    });


    it('should not leak registered clients after disconnect', function () {
        var b = broadcast();
        b.mount(['blood', 'pressure'], function () {});
        b.send(['broadcast', 'register', 'blood', 'pressure']);
        b.send(['broadcast', 'subscribe', 'blood', 'pressure'], ['father']);
        b.send(['broadcast', 'subscribe', 'blood', 'pressure', 'cuff'], ['father']);
        assert.equal(2, b._clientSubscriptions.listeners('**').length);
        b.send(['disconnect', 'blood', 'pressure']);
        assert.equal(0, b.listeners(['disconnect', '**']).length);
        assert.equal(0, b._clientSubscriptions.listeners('**').length);
    });

    it('should not leak subscriptions', function () {
        var b = broadcast();
        b.mount(['this', 'system'], function () {});
        b.send(['broadcast', 'register', 'this', 'system']);
        b.send(['broadcast', 'subscribe', 'this', 'system'], ['moment']);
        b.send(['broadcast', 'subscribe', 'this', 'system', 'school'], ['not']);
        assert.equal(2, b._clientSubscriptions.listeners('**').length);
        b.send(['broadcast', 'unsubscribe', 'this', 'system']);
        b.send(['broadcast', 'unsubscribe', 'this', 'system', 'school']);
        assert.equal(0, b.listeners(['broadcast', 'unsubscribe', '**']).length);
        assert.equal(1, b.listeners(['disconnect', '**']).length);
        assert.equal(0, b._clientSubscriptions.listeners('**').length);
    });



});
