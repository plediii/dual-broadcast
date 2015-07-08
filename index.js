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
        d.mount(route, {
            register: {
                '::client': function (body, ctxt) {
                    var client = ctxt.params.client;
                    var prefixlen = ctxt.to.length - client.length;
                    var clientSubscriptions = new Domain();
                    var unsubscribeRoute = route.concat('unsubscribe').concat(client);
                    var subscribeRoute = route.concat('subscribe').concat(client);

                    clientSubscriptions.on(['removeListener'], function (subscription, f) {
                        subscriptions.removeListener(subscription, f);
                        d.send(route.concat(['removeListener']), subscription, f.client);
                        d.send(route.concat(['removeListener'].concat(subscription)), subscription, f.client);
                    });

                    var subscribe = function (body, ctxt) {
                        var subscription = ctxt.from;
                        var subclient = ctxt.to.slice(prefixlen);
                        var transfer = function (body, ctxt) {
                            d.send({
                                to: subclient
                                , from: ctxt.from
                                , body: body
                                , options: ctxt.options
                            });
                        };
                        transfer.client = subclient;
                        subscriptions.mount(subscription, transfer);
                        clientSubscriptions.on(subscription, transfer);
                        d.send(route.concat(['newListener']), subscription, subclient);
                        d.send(route.concat(['newListener'].concat(subscription)), subscription, subclient);
                    };

                    var removeSubscription = function (subscription) {
                        clientSubscriptions.removeAllListeners(subscription);
                    };
                    
                    var unsubscribe = function (body, ctxt) {
                        removeSubscription(ctxt.from);
                    };

                    d.mount(subscribeRoute, subscribe);
                    d.mount(subscribeRoute.concat('**'), subscribe);
                    d.mount(unsubscribeRoute, unsubscribe);
                    d.mount(unsubscribeRoute.concat('**'), unsubscribe);
                    d.once(['disconnect'].concat(client), function () {
                        d.unmount(subscribeRoute);
                        d.unmount(unsubscribeRoute);
                        removeSubscription('**');
                    });
                }
            }
            , send: function (body, ctxt) {
                var subscription = ctxt.from;
                subscriptions.send({
                    to: subscription
                    , from: subscription
                    , body: body
                    , options: ctxt.options
                });
            }
            , autoregister: {
                '::clients': function (body, ctxt) {
                    var clients = ctxt.params.clients;
                    var prefixlen = ctxt.to.length - clients.length;
                    d.mount(['connect'].concat(clients), function (body, ctxt) {
                        d.send(route.concat('register').concat(ctxt.to.slice(1)));
                    });
                }
            }
        });
    };
};
