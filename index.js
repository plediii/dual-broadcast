/*jslint node: true */
"use strict";

module.exports = function (Domain, libs) {
    var _ = libs._;
    Domain.prototype.broadcast = function (route) {
        var d = this;
        var subscriptions = new Domain();
        d.mount(route, {
            subscribe: {
                '::subscriber': function (body, ctxt) {
                    var subscriber = ctxt.params.subscriber;
                    var subscription = ctxt.from;
                    console.log('mounting subscription ', subscription);
                    subscriptions.mount(subscription, function (body, ctxt) {
                        console.log('broadcasting ', ctxt.from, ' -> ', subscription);
                        d.send(_.defaults({
                            to: subscriber
                        }, ctxt));
                    });
                }
            }
            , unsubscribe: {
                '::subscriber': function (body, ctxt) {
                    
                }
            }
            , send: function (body, ctxt) {
                console.log('sending ', ctxt.from);
                subscriptions.send(ctxt.from);
            }
        });
    };
};
