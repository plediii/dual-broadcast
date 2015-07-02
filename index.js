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
                    var unsubscriptions = new Domain();
                    var unsubscribeRoute = route.concat('unsubscribe').concat(client);
                    var subscribeRoute = route.concat('subscribe').concat(client);
                    d.mount(subscribeRoute, function (body, ctxt) {
                        var subscription = ctxt.from;
                        var transfer = function (body, ctxt) {
                            d.send({
                                to: client
                                , from: ctxt.from
                                , body: body
                                , options: ctxt.options
                            });
                        };

                        subscriptions.mount(subscription, transfer);
                        unsubscriptions.once(subscription, function (body, ctxt) {
                            subscriptions.removeListener(subscription, transfer);
                        });
                        d.send(route.concat(['newListener']), subscription);
                        d.send(route.concat(['newListener'].concat(client)), subscription);
                    });
                    d.mount(unsubscribeRoute, function (body, ctxt) {
                        var subscription = ctxt.from;
                        unsubscriptions.send(subscription);
                        d.send(route.concat(['removeListener']), subscription);
                        d.send(route.concat(['removeListener'].concat(client)), subscription);
                    });
                    d.once(['disconnect'].concat(client), function () {
                        unsubscriptions.send(['**']);
                        d.unmount(subscribeRoute);
                        d.unmount(unsubscribeRoute);
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
        });
    };
};
