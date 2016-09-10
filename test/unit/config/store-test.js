var proxyquire = require('proxyquire').noCallThru()
var test = require('tap').test

var preAuthHookStub = {}
var storeConfig = proxyquire('../../../lib/config/store', {
  './pre-auth-hook': preAuthHookStub
})

test('store config', function (t) {
  storeConfig({
    db: {},
    config: {
      PouchDB: 'PouchDB',
      store: {}
    }
  }, function (error, config) {
    t.error(error)

    t.is(config.store.PouchDB, 'PouchDB', 'sets config.store.PouchDB')
    t.same(config.store.hooks.onPreAuth, preAuthHookStub, 'sets pre auth hook')

    t.end()
  })
})
