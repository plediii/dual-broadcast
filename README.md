
# Broadcaster for dualapi [![Build Status](http://jenkins.plediii.net:8080/buildStatus/icon?job=dual-broadcast master)](http://jenkins.plediii.net:8080/job/dual-broadcast%20master/)

Create a dual api domain with fan-out capability.  


## Construct a broadcasting domain

```javascript
var broadcast = require('dual-broadcast');
var b = broadcast();
```


## Register a broadcast recipient

To register the mount point `['client', xxxxx]` as potential recipient
of broadcasts, send a message to
```javascript
b.send(['broadcast', 'register', 'client', xxxxx]);
```

## Subscribe to a broadcast channel

To subscribe `['client', xxxxx]` to the broadcast point `['bbc',
'eight']`, send to the subscription host from the broadcast point.

```javascript
b.send(['broadcast', 'subscribe', 'client', xxxxx], ['bbc', 'eight']);
```

## Broadcasting

Now, sending to `['broadcast', 'send']`, from the desired broadcast
point, copies the message to all subscribers.

```javascript
b.send(['broadcast', 'send'], ['bbc', 'eight'], 'bbc heaven');
```

## Unsubscribing

Broadcast clients may be unsubscribed from specific subscriptions,
mirroring the subscription pattern.

```javascript
b.send(['broadcast', 'unsubscribe', 'client', xxxxx], ['bbc', 'eight']);
```

## Disconnecting

A client is unsubscribed from all subscriptions, and removed as a
potential subscription host, by sending a disconnect message.

```javascript
b.send(['disconnect', 'client', xxxxx]);
```





