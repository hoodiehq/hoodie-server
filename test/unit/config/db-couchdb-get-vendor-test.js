var simple = require('simple-mock')
var test = require('tap').test

var getVendor = require('../../../lib/config/db/couchdb-get-vendor.js')

test('check couch vendor', function (group) {
  group.test('request fails', function (t) {
    t.plan(2)

    getVendor({
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

    getVendor({
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
    t.plan(2)

    var logStub = simple.stub()

    getVendor({
      server: {
        log: logStub
      }
    }, function (input, callback) {
      callback(null, {
        statusCode: 200
      }, {
        'couchdb': 'Welcome'
      })
    }, function (error, vendor) {
      t.error(error)
      t.is(typeof vendor, 'object')
    })
  })

  group.end()
})
