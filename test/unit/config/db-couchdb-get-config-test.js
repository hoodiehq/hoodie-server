var nock = require('nock')
var test = require('tap').test
var request = require('request')

var getConfig = require('../../../lib/config/db/couchdb-get-config.js')

var state = {
  server: {
    log: function () {}
  }
}

var couch = request.defaults({
  baseUrl: 'http://a:b@127.0.0.1:5984/',
  json: true
})

test('get couch config', function (group) {
  group.test('couchdb allows `/_config`', function (t) {
    t.plan(4)

    nock('http://127.0.0.1:5984')
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

      .put('/_config/httpd/authentication_handlers')
      .reply(204)

    getConfig(state, couch, function (error, config) {
      t.error(error)
      t.is(config.admins.user, 'secret')
      t.is(config.couch_httpd_auth.secret, 'foo')
      t.is(config.couch_httpd_auth.authentication_db, '_users')
    })
  })

  group.test('couchdb disallows `/_config`', function (t) {
    t.plan(4)

    nock('http://127.0.0.1:5984')
      .get('/_config')
      .reply(403)

    getConfig(state, couch, function (error, config) {
      t.error(error)
      t.is(config.admins, undefined)
      t.is(config.couch_httpd_auth.secret, undefined)
      t.is(config.couch_httpd_auth.authentication_db, '_users')
    })
  })

  group.end()
})
