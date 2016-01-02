
# Broadcaster for dual-protocol [![Build Status](https://travis-ci.org/plediii/dual-broadcast.svg?branch=master)](https://travis-ci.org/plediii/dual-broadcast)

Fan-out dual-protocol messages.

## Construct a broadcasting domain

Extend a [dual-protocol](https://github.com/plediii/dual-protocol) domain, with the dual-broadcast module.
```javascript
var dual = require('dual-protocol').use(require('dual-broadcast'));
```

Domains with this extension can add broadcast hosts:
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
emitted on the domain on which the broadcaster is created.

## Subscribe a registered client to a broadcast channel

To subscribe the registered `['client', xxxxx]` to the broadcast point `['bbc',
'eight']`, 

```broadcaster.subscribe(['client', xxxxx], ['bbc', 'eight']); ``` 
with the broadcast identifier as the second argument.

## Broadcasting

Broadcast a message to every subscribed recipient by
```javascript
broadcaster.send(['bbc', 'eight'], 'bbc heaven');
```

## Unsubscribing

Broadcast clients may be unsubscribed from specific subscriptions,
mirroring the subscription pattern.

```javascript
broadcaster.unsubscriber(['client', xxxxx], ['bbc', 'eight']);
```

## Disconnecting

A client is unsubscribed from all subscriptions, and removed as a
potential subscription host, by sending a disconnect message on the broadcast domain:
```javascript
domain.send(['disconnect', 'client', xxxxx]);
```

## Auto-registering clients

Clients may be automatically registered on `['connect', '**']` events
by using the `autoregister` function.

```javascript
broadcaster.autoregister(['client', '*']);
domain.send(['connect', 'client', 'zzz']);
```
At this point, `['client', 'zzz']` would be registered, as would any other client matching `['client', '*']`.





