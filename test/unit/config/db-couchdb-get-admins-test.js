var test = require('tap').test

var getAdmins = require('../../../lib/config/db/couchdb-get-admins.js')

test('get couch admins', function (group) {
  group.test('request fails', function (t) {
    t.plan(2)

    getAdmins(function (input, callback) {
      callback(new Error())
    }, function (error) {
      t.ok(error instanceof Error)
    })

    getAdmins(function (input, callback) {
      callback(null, {statusCode: 500})
    }, function (error) {
      t.ok(error instanceof Error)
    })
  })

  group.test('request succeds', function (t) {
    getAdmins(function (input, callback) {
      t.is(input.url, '/_config/admins')
      callback(null, null, {
        user: 'secret'
      })
    }, function (error, admins) {
      t.error(error)

      t.is(admins.user, 'secret')
      t.end()
    })
  })

  group.end()
})
