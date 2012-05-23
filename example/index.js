var RedisEmitter = require('..').RedisEmitter

var emitterA = new RedisEmitter()
var emitterB = new RedisEmitter()

emitterA.on('a nice channel', function(data) {
  console.log('got data on a nice channel:', data)

}, function() {
  emitterB.emit('a nice channel', 'B')
  emitterA.emit('a nice channel', 'A')
})
