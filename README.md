
# Broadcaster for dual-protocol [![Build Status](https://travis-ci.org/plediii/dual-broadcast.svg?branch=master)](https://travis-ci.org/plediii/dual-broadcast)

Fan-out dual-protocol messages.

## Construct a broadcasting domain

[dual-protocol](https://github.com/plediii/dual-protocol) domains may be extended with the *dual-broadcast* module:
```javascript
var dual = require('dual-protocol').use(require('dual-broadcast'));
```

Domains with this extension can create broadcast objects:
```javascript
var domain = dual();
var broadcaster = domain.broadcast(['b']);
```

Here we've provided a specific mount point for the broadcaster at
`['b']`.  *newListener* and *removeListener* events will be emitted
below that endpoint.  By default, the broadcaster is mounted at
`['broadcast']`.


## Register a broadcast recipient

To register a mount point `['client', xxxxx]` as potential recipient
of broadcasts:
```javascript
broadcaster.register(['client', xxxxx]);
```

A map of subscriptions is created for each client.  The subscriptions
will be removed when the `['disconnect', 'client', xxxx]` event is
emitted on the domain.

## Subscribe a registered client to a broadcast channel

To subscribe the registered `['client', xxxxx]` to the broadcast point `['bbc',
'eight']`: 
```javascript
	broadcaster.subscribe(['client', xxxxx], ['bbc', 'eight']); 
``` 
The registered client `['client', xxxxx]` would now receive broadcasts from `['bbc', 'eight']`.


## Broadcasting

Broadcast a message to every subscribed recipient by
```javascript
broadcaster.send(['bbc', 'eight'], 'hello', { optional: 'metadata' });
```
All subscribers would receive a message from `['bbc', 'eight']` with body `'hello'`, and the given *dualapi options*.

## Unsubscribing

Broadcast clients may be unsubscribed from specific subscriptions:
```javascript
broadcaster.unsubscribe(['client', xxxxx], ['bbc', 'eight']);
```

## Disconnecting

A client is unsubscribed from all subscriptions, and removed as a
potential subscription host, when the domain emits a *disconnect* event:
```javascript
domain.send(['disconnect', 'client', xxxxx]);
```

## Auto-registering clients

Clients may be automatically registered on `['connect', '**']` events
by using the *autoregister* function.

```javascript
broadcaster.autoregister(['client', '*']);
domain.send(['connect', 'client', 'zzz']);
```
At this point, `['client', 'zzz']` would be registered, as would any other client matching `['client', '*']` when they
connect.

## *newListener* events
When a subscriber is added to a broadcast channel, the domain emits a *newListener* event
```javascript
domain.mount(['b', 'newListener'], function (body, ctxt) {
   console.log(body.join('/'), ' is now a subscriber to ', ctxt.from.join('/'));
});
```
New subscribers on specific broadcast channels are are emitted *below* the **newListener** endpoint:
```javascript
domain.mount(['b', 'newListener', 'bbc', 'eight'], function (body, ctxt) {
   console.log(body.join('/'), ' is now a subscriber to ', ctxt.from.join('/'));
});
```

## *removeListener* events 

When a subscriber is removed from a broadcast channel, either by
*unsubscribe* or *disconnect*ing, the domain emits a *removeListener*
event
```javascript
domain.mount(['b', 'removeListener'], function (body, ctxt) {
   console.log(body.join('/'), ' is no longer a subscriber to ', ctxt.from.join('/'));
});
```
Subscribers leaving a specific broadcast channel are emitted *below* the **removeListener** endpoint:
```javascript
domain.mount(['b', 'removeListener', 'bbc', 'eight'], function (body, ctxt) {
   console.log(body.join('/'), ' is no longer a subscriber to ', ctxt.from.join('/'));
});
```


