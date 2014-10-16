/*jslint node: true */
"use strict";

var dualapi = require('dualapi');

module.exports = function () {
    var b = dualapi();

    var clients = {};
    var broadcasts = {};

    var clientSubscriptions = dualapi({ delimiter: '/' });

    b.mount(['broadcast'], {
        register: {
            '**': function (msg) {
                var client = msg.to.slice(2);
                b.mount(['broadcast', 'subscribe'].concat(client, '**'), function (ctxt) {
                    var subclient = ctxt.to.slice(2);
                    var subscription = ctxt.from;
                    var transfer = function (ctxt) {
                        b.send(subclient, subscription, ctxt.body);
                    };
                    var cleanup = function () {
                        clientSubscriptions.removeListener(ctxt.from, transfer);
                        b.removeListener(['disconnect'].concat(client, '**'), cleanup);
                        b.removeListener(['broadcast', 'unsubscribe'].concat(subclient, '**'), cleanup);
                    };
                    b.once(['disconnect'].concat(client, '**'), cleanup);
                    b.once(['broadcast', 'unsubscribe'].concat(subclient), cleanup);

                    clientSubscriptions.mount(subscription, transfer);
                });

                b.once(['disconnect'].concat(client, '**'), function (ctxt) {
                    b.unmount(['*'].concat(client, '**'));
                });
            }
        }
        , send: function (ctxt, next) {
            process.nextTick(function () {
                clientSubscriptions.send(ctxt.from, [], ctxt.body);
            });
            next();
        }
    });

    b._clientSubscriptions = clientSubscriptions;

    return b;
};
