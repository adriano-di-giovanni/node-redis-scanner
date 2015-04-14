'use strict';

var
  _ = require('underscore'),
  async = require('async'),
  redis = require('redis');

require('node-redis-streamify')(redis);

function RedisScanner() {
  this._client = redis.createClient.apply(redis, arguments);
  this._patternArray = [];
  this._handlerByPattern = {};
  this._isScanning = false;
}

_.extend(RedisScanner.prototype, {
  onMatch: function (pattern, handler) {

    if ( ! _.isString(pattern)) {
      throw new Error('Wrong type for argument 1, pattern. String expected.');
    }

    if ( ! _.isFunction (handler)) {
      throw new Error('Wrong type for argument 2, handler. Function expected.');
    }

    this._patternArray.push(pattern);
    this._handlerByPattern[pattern] = handler;

    return this;
  },
  onError: function (handler) {

    if ( ! _.isFunction(handler)) {
      throw new Error('Wrong type for argument 1, handler. Function expected.');
    }

    this._onError = handler;

    return this;
  },
  onEnd: function (handler) {

    if ( ! _.isFunction(handler)) {
      throw new Error('Wrong type for argument 1, handler. Function expected.');
    }

    this._onEnd = handler;

    return this;
  },
  isScanning: function () {
    return this._isScanning;
  },
  start: function () {

    if (this._isScanning) { return; }

    this._isScanning  = true;

    var
      patternArray = this._patternArray,
      handlerByPattern = this._handlerByPattern,
      client = this._client,
      context = this;

    async.eachSeries(
      patternArray,
      function (pattern, callback) {

        var
          handler = handlerByPattern[pattern],
          scan = client.streamified('SCAN')(pattern),
          end = _.once(callback),
          done = function (error) {
            if (error) { return end(error); }
            scan.resume();
          };

        scan
          .on('data', function (data) {
            scan.pause();
            handler(pattern, data, client, _.once(done));
          })
          .on('error', function (error) {
            end(error);
          })
          .on('end', function () {
            end();
          });
      },
      function (error) {
        context._client.quit();
        context._isScanning = false;

        if (error) {
          return context._onError(error);
        }

        context._onEnd();
      }
    );
  },
  _onError: _.noop,
  _onEnd: _.noop
});

module.exports = RedisScanner;
