

var dualproto = require('dual-protocol');
var api = dualproto.use(require('./index'));
var d = api();

var b = d.broadcast(['b']);


// basic subscription
d.mount(['client', 'xxx', 'receiver'], function (body) {
    console.log('client xxxx receiver received: ', body)
});
b.register(['client', 'xxx']);
// subscribe client/receiver to bbc/eight
b.subscribe(['client', 'xxx', 'receiver'], ['bbc', 'eight']);
// broadcast on bbc/eight
b.send(['bbc', 'eight'], 'bbc one');

// autoregister client/*
b.autoregister(['client', '*']);

d.mount(['client', 'yyy', 'endpoint'], function (body) {
    console.log('client yyy endpoint received: ', body);
});
// connect a client, it will be auto-registered
d.send(['connect', 'client', 'yyy']);
// subscribe the auto regsitered client
b.subscribe(['client', 'yyy', 'endpoint'], ['bbc', 'eight']);
// broadcast to all bbc eight listners
b.send(['bbc', 'eight'], 'bbc two');
// disconnect all clients
d.send(['disconnect', 'client', '**']);

// no one will receive this broadcast
b.send(['bbc', 'eight'], 'bbc three');

console.log('bbc three was silent...')
