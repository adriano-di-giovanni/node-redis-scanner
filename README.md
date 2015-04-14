# node-redis-scanner

A Redis scanner for Node.js.

## Installation

```
npm install node-redis-scanner --save
```

## Usage

```javascript
var
	RedisScanner = require('node-redis-scanner');

var
	// see https://github.com/mranney/node_redis#rediscreateclient
	// for RedisScanner arguments
	scanner = new RedisScanner();

var
	counterByPattern = {};

scanner
	.onMatch('path:to:key:*', function (pattern, match, client, done) {
		if ( ! counterByPattern[pattern]) {
			counterByPattern[pattern] = 0;
		}
		counterByPattern[pattern] += 1;
		done();
	})
	.onMatch('path:to:another-key:*', function (pattern, match, client, done) {
		client.del(match, function (error) {
			done(error);
		});
	})
	.onError(function (error) {
		// your code here
	})
	.onEnd(function () {
		// your code here
	})
	.start(); // let's scan
```
