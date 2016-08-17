var proxyquire = require('proxyquire').noCallThru()
var test = require('tap').test

var preAuthHookStub = {}
var storeConfig = proxyquire('../../../lib/config/store', {
  './pre-auth-hook': preAuthHookStub
})

test('store config', function (group) {
  group.test('with config.db.url = http://foo:bar@baz.com', function (group) {
    storeConfig({
      db: {
        options: {
          prefix: 'http://foo:bar@baz.com'
        }
      },
      config: {
        store: {}
      }
    }, function (error, config) {
      group.error(error)

      group.is(config.store.couchdb, 'http://foo:bar@baz.com/', 'sets config.store.couchdb')
      group.is(config.store.PouchDB, undefined, 'does not set config.store.PouchDB')

      group.end()
    })
  })

  group.test('without config.db.url', function (group) {
    storeConfig({
      db: {},
      config: {
        PouchDB: 'PouchDB',
        store: {}
      }
    }, function (error, config) {
      group.error(error)

      group.is(config.store.PouchDB, 'PouchDB', 'sets config.store.PouchDB')
      group.is(config.store.couchdb, undefined, 'does not set config.store.couchdb')

      group.end()
    })
  })

  group.end()
})
