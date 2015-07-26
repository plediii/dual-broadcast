
# Broadcaster for dualapi [![Build Status](http://jenkins.plediii.net:8080/buildStatus/icon?job=dual-broadcast master)](http://jenkins.plediii.net:8080/job/dual-broadcast%20master/)

Create a dual api domain with fan-out capability.  

## Construct a broadcasting domain

Any [dual-protocol](https://github.com/plediii/dual-protocol) domain (including [dualapi](https://github.com/plediii/dualapi)), can be extended with dual-broadcast.
```javascript
var dual = require('dual-protocol').use(require('dual-broadcast'));
```

Domains with this extension can add broadcast hosts:
```javascript
var domain = dual();
domain.broadcast(['b']);
```

Here we've provided a specific mount point for the broadcaster at
`['b']`.  All the broadcaster functions will be mounted below this
route.  By default, the broadcaster is mounted at `['broadcast']`.


## Register a broadcast recipient

To register a mount point `['client', xxxxx]` as potential recipient
of broadcasts, send a message to
```javascript
domain.send(['b', 'register', 'client', xxxxx]);
```

A map of subscriptions is created for each client.  The subscriptions
will be removed when the `['disconnect', 'client', xxxx]` event is
emitted.

## Subscribe a registered client to a broadcast channel

To subscribe the registered `['client', xxxxx]` to the broadcast point `['bbc',
'eight']`, send to

```domain.send(['b', 'subscribe', 'client', xxxxx], ['bbc', 'eight']); ``` 
with the broadcast point as the source address.  Using the source
address allows the broadcast source to be automatically layered by transports like
[dual-engine.io](https://github.com/plediii/dual-engine.io).

## Broadcasting

Now, sending to `['b', 'send']`, from the desired broadcast
point, copies the message to all subscribers.

```javascript
domain.send(['b', 'send'], ['bbc', 'eight'], 'bbc heaven');
```

## Unsubscribing

Broadcast clients may be unsubscribed from specific subscriptions,
mirroring the subscription pattern.

```javascript
domain.send(['b', 'unsubscribe', 'client', xxxxx], ['bbc', 'eight']);
```

## Disconnecting

A client is unsubscribed from all subscriptions, and removed as a
potential subscription host, by sending a disconnect message:
```javascript
domain.send(['disconnect', 'client', xxxxx]);
```

## Auto-registering clients

Clients may be automatically registered on `['connect', '**']` events
by using the `autoregister` route.

```javascript
domain.send(['b', 'autoregister', 'client', '*']);
domain.send(['connect', 'client', 'zzz']);
```
At this point, `['client', 'zzz']` would be registered, as would any `['client', '*']`.





