
var EventEmitter = require('events').EventEmitter
  , util = require('util')


exports.RedisEmitter = RedisEmitter


function RedisEmitter(opts) {
  EventEmitter.call(this)

  this.opts = opts = opts || {}

  this.redis = opts.redis || require('redis')

  if (opts.pack) {
    this.pack = opts.pack
    this.unpack = opts.unpack
  } else {
    this.pack = JSON.stringify
    this.unpack = JSON.parse
  }

  this.prefix = opts.prefix || ''
}
util.inherits(RedisEmitter, EventEmitter)


RedisEmitter.prototype.createClient = function(type) {
  var client
  if (this.opts[type] instanceof (this.redis.RedisClient)) {
    client = opts[type]
  } else {
    client = this.redis.createClient(this.opts.port, this.opts.host, this.opts)
  }

  client.on('error', EventEmitter.prototype.emit.bind(this))

  Object.defineProperty(this, type, { enumerable: true
                                    , writable: false
                                    , value: client
                                    })

  this[type] = client
}

Object.defineProperty(RedisEmitter.prototype, 'pub', {
  get: function() {
    this.createClient('pub')
    return this.pub
  }
})

Object.defineProperty(RedisEmitter.prototype, 'sub', {
  get: function() {
    this.createClient('sub')

    var self = this
    this.sub.on('message', function(name, args) {
      args = self.unpack(args)
      if (self.prefix.length) name = name.substring(self.prefix.length)
      args.unshift(name)
      EventEmitter.prototype.emit.apply(self, args)
    })

    return this.sub
  }
})

RedisEmitter.prototype.emit = function (name) {
  if (name === 'error' || name === 'newListener' || name === 'removeListener') {
    return EventEmitter.prototype.emit.apply(this, arguments)
  }

  var args = Array.prototype.slice.call(arguments, 1)
  this.pub.publish(this.prefix + name, this.pack(args))
}

RedisEmitter.prototype.on =
RedisEmitter.prototype.addListener = function (name, listener, fn) {
  EventEmitter.prototype.addListener.call(this, name, listener)

  if (name === 'error' || name === 'newListener' || name === 'removeListener')
    return

  this.sub.subscribe(this.prefix + name)

  if (fn) {
    var self = this

    self.sub.on('subscribe', function subscribe (ch) {
      if (name == ch) {
        self.sub.removeListener('subscribe', subscribe)
        fn()
      }
    })
  }
}

RedisEmitter.prototype.removeListener = function (name) {
  EventEmitter.prototype.removeListener.apply(this, arguments)

  if (EventEmitter.listenerCount(this, name) === 0) {
    this.sub.unsubscribe(this.prefix + name)
  }
}

RedisEmitter.prototype.removeAllListener = function (name) {
  EventEmitter.prototype.removeAllListener.apply(this, arguments)

  this.sub.unsubscribe(this.prefix + name)
}

RedisEmitter.prototype.end = function () {
  if (this.hasOwnProperty('pub')) this.pub.end()
  if (this.hasOwnProperty('sub')) this.sub.end()
}
