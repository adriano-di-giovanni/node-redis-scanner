# node-redis-scanner

## Installation

```
npm install node-redis-scanner --save
```

Usage

```javascript
var
	RedisScanner = require('node-redis-scanner');

var
	// see https://github.com/mranney/node_redis#rediscreateclient
	scanner = new RedisScanner();

scanner
	.onMatch('path:to:key:*', function (match, client, done) {
		client.del(match, function (error) {
			done(error);
		});
	})
	.onMatch('path:to:another-key:*', function (match, client, done) {
		// your code here
	})
	.onError(function (error) {
		// your code here
	})
	.onEnd(function () {
		// your code here
	})
	.start(); // let's scan
```
