/*jslint node: true */
"use strict";

module.exports = function (Domain, libs) {
    var _ = libs._;
    Domain.prototype.broadcast = function (route) {
        if (!_.isArray(route)) {
            route = ['broadcast'];
        }
        var d = this;
        var subscriptions = new Domain();
        var clients = new Domain();

        var register = function (client) {
            var clientSubscriptions = new Domain();

            clientSubscriptions.on(['removeListener'], function (subscription, f) {
                subscriptions.removeListener(subscription, f);
                d.send(route.concat(['removeListener']), subscription, f.client);
                d.send(route.concat(['removeListener'].concat(subscription)), subscription, f.client);
            });

            var removeSubscription = function (subscription) {
                clientSubscriptions.removeAllListeners(subscription);
            };

            var handleClient = function (body, ctxt) {
                if (body.subscribe) {
                    var subscription = body.subscribe;
                    var subscriber = client;
                    if (ctxt.params && ctxt.params.subhost) {
                        subscriber = subscriber.concat(ctxt.params.subhost);
                    }
                    var transfer = function (body, ctxt) {
                        d.send({
                            to: subscriber
                            , from: ctxt.from
                            , body: body
                            , options: ctxt.options
                        });
                    };
                    transfer.client = subscriber;
                    subscriptions.mount(subscription, transfer);
                    clientSubscriptions.on(subscription, transfer);
                    d.send(route.concat(['newListener']), subscription, subscriber);
                    d.send(route.concat(['newListener'].concat(subscription)), subscription, subscriber);
                } else {
                    // unsubscribe
                    removeSubscription(body.unsubscribe);
                }
            };

            clients.mount(client, handleClient);
            clients.mount(client.concat('::subhost'), handleClient);

            d.once(['disconnect'].concat(client), function () {
                clients.unmount(client);
                removeSubscription('**');
            });            
        };

        return {
            autoregister: function (clients) {
                d.mount(['connect'].concat(clients), function (body, ctxt) {
                    register(ctxt.to.slice(1));
                });
            }
            , register: register
            , send: function (subscription, body, options) {
                subscriptions.send({
                    to: subscription
                    , from: subscription
                    , body: body
                    , options: options
                });
            }
            , subscribe: function (client, subscription) {
                return clients.send(client, [], { subscribe: subscription });
            }
            , unsubscribe: function (client, subscription) {
                clients.send(client, [], { unsubscribe: subscription });
            }
        };
    };
};
