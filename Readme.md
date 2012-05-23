# RedisEmitter


RedisEmitter implement redis pub / sub as a EventEmitter.


## Example

```js
var RedisEmitter = require('redis-emitter').RedisEmitter

var emitter = new RedisEmitter()

emitter.on('a nice channel', function(data) {
  console.log('got data on a nice channel:', data)
})
```


```js
var RedisEmitter = require('RedisEmitter').RedisEmitter

var emitter = new RedisEmitter()
emitter.emit('a nice channel', 'some data')

// Close the connection to redis
redis.end()
```

## Install

    npm install redis-emitter


## Licence

MIT
