var simple = require('simple-mock')
var test = require('tap').test

var checkVendor = require('../../../lib/config/db/couchdb-check-vendor.js')

test('check couch vendor', function (group) {
  group.test('request fails', function (t) {
    t.plan(2)

    checkVendor({
      db: {
        options: {
          prefix: 'http://localhost:5984'
        }
      }
    }, function (input, callback) {
      callback(new Error())
    }, function (error) {
      t.match(error.message, 'http://localhost:5984')
    })

    checkVendor({
      db: {
        options: {
          prefix: 'http://localhost:5984'
        }
      }
    }, function (input, callback) {
      callback(null, {statusCode: 500})
    }, function (error) {
      t.match(error.message, 'http://localhost:5984')
    })
  })

  group.test('verify vendor', function (t) {
    t.plan(3)

    var logStub = simple.stub()

    checkVendor({
      server: {
        log: logStub
      }
    }, function (input, callback) {
      callback(null, {
        statusCode: 200
      }, {
        '<% VENDOR %>': 'Welcome!'
      })

      t.is(logStub.callCount, 1)
      t.match(logStub.lastCall.args[1], /<% VENDOR %>/)
    }, t.error)
  })

  group.end()
})
