var test = require('tap').test

var toCouchDbUrl = require('../../lib/utils/pouchdb-options-to-couchdb-url')

test('utils/toCouchDbUrl', function (group) {
  group.test('with no options', function (t) {
    var url = toCouchDbUrl()
    t.is(url, undefined)
    t.end()
  })

  group.test('with {prefix: "foo"}', function (t) {
    var url = toCouchDbUrl({prefix: 'foo'})
    t.is(url, undefined)
    t.end()
  })

  group.test('with {prefix: "http://localhost:5984"}', function (t) {
    var url = toCouchDbUrl({prefix: 'http://localhost:5984'})
    t.is(url, 'http://localhost:5984/')
    t.end()
  })

  group.test('with {prefix: "http://admin:secret@localhost:5984"}', function (t) {
    var url = toCouchDbUrl({prefix: 'http://admin:secret@localhost:5984'})
    t.is(url, 'http://admin:secret@localhost:5984/')
    t.end()
  })

  group.test('with {prefix: "http://localhost:5984", auth: {username: "admin", password: "secret"}}', function (t) {
    var url = toCouchDbUrl({prefix: 'http://localhost:5984', auth: {username: 'admin', password: 'secret'}})
    t.is(url, 'http://admin:secret@localhost:5984/')
    t.end()
  })

  group.end()
})
