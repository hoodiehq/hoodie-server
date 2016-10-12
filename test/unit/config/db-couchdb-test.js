var nock = require('nock')
var test = require('tap').test

test('init couchdb', function (t) {
  nock('http://127.0.0.1:5984')
    .get('/')
    .reply(200, {couchdb: 'Welcome'})

    .get('/_config')
    .reply(200, {
      admins: {
        user: 'secret'
      },
      couch_httpd_auth: {
        secret: 'foo',
        authentication_db: '_users'
      }
    })

    // mocks for migration
    .get('/hoodie-store')
    .reply(200)

  var couchdb = require('../../../lib/config/db/couchdb')

  couchdb({
    server: {
      log: function () {}
    },
    db: {
      options: {
        prefix: 'http://a:b@127.0.0.1:5984/'
      }
    }
  }, function (error, result) {
    t.error(error)

    t.is(result.db.secret, 'foo')
    t.is(result.db.authenticationDb, '_users')
    t.same(result.db.admins, {
      user: 'secret'
    })

    t.end()
  })
})

test('init couchdb error handling', function (t) {
  nock('http://127.0.0.1:5984')
    .get('/')
    .reply(500, 'ooops')

  var couchdb = require('../../../lib/config/db/couchdb')

  couchdb({
    db: {
      options: {
        prefix: 'http://a:b@127.0.0.1:5984/'
      }
    }
  }, function (error, result) {
    t.ok(error)
    t.is(error.message, 'Could not find CouchDB at http://127.0.0.1:5984/')
    t.end()
  })
})
