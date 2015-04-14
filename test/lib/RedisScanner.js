'use strict';

var
  redis = require('redis');

var
  RedisScanner = require('../../lib/RedisScanner');

module.exports = function () {
  describe('RedisScanner', function () {
    it('should work', function (done) {
      var
        scanner = new RedisScanner();

      expect(scanner).to.be.instanceof(RedisScanner);
      expect(scanner._client).to.be.instanceof(redis.RedisClient);

      scanner
        .onMatch('*', function (pattern, match, client, done) {
          expect(pattern).to.equal('*');
          expect(match).to.be.a('string');
          expect(client).to.be.instanceof(redis.RedisClient);
          expect(done).to.be.a('function');
          done();
        })
        .onError(function (error) {
          done(error); // mocha
        })
        .onEnd(function () {
          done(); // mocha
        })
        .start();
    });
  });
};
