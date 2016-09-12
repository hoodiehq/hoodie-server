var proxyquire = require('proxyquire').noCallThru()
var simple = require('simple-mock')
var test = require('tap').test

var serverMock = {}

test('config', function (group) {
  group.test('defaults', function (t) {
    var accountConfigMock = simple.stub().callbackWith(null)
    var assureFolders = simple.stub().callbackWith(null)
    var couchDbConfigMock = simple.stub().callbackWith(null)
    var getDatabaseFactoryMock = simple.stub().returnWith('getDatabase')
    var appOptionsMock = simple.stub().returnWith('app options')
    var pouchDbConfigMock = simple.stub().callbackWith(null)
    var storeConfigMock = simple.stub().callbackWith(null)

    var getConfig = proxyquire('../../lib/config', {
      './account': accountConfigMock,
      './assure-folders': assureFolders,
      './db/couchdb': couchDbConfigMock,
      './db/factory': getDatabaseFactoryMock,
      './app-options': appOptionsMock,
      './db/pouchdb': pouchDbConfigMock,
      './store': storeConfigMock,
      'fs': {
        statSync: simple.stub().returnWith({
          isDirectory: simple.stub()
        })
      }
    })

    var PouchDBMock = function () {
      return {
        __opts: {}
      }
    }
    PouchDBMock.preferredAdapters = ['test']

    getConfig(serverMock, {
      PouchDB: PouchDBMock
    }, function (error, config) {
      t.error(error)

      var state = {
        server: serverMock,
        config: config,
        inMemory: false,
        PouchDB: PouchDBMock,
        db: {
          options: {}
        }
      }

      t.is(couchDbConfigMock.callCount, 0, 'couchdb config not called')
      t.same(accountConfigMock.lastCall.arg, state, 'called account config')
      t.same(storeConfigMock.lastCall.arg, state, 'called store config')

      t.ok(pouchDbConfigMock.lastCall.k < accountConfigMock.lastCall.k, 'pouch config called before account config')
      t.ok(pouchDbConfigMock.lastCall.k < storeConfigMock.lastCall.k, 'pouch config called before store config')

      t.end()
    })
  })

  group.test('with http adapter', function (t) {
    var accountConfigMock = simple.stub().callbackWith(null)
    var assureFolders = simple.stub().callbackWith(null)
    var couchDbConfigMock = simple.stub().callbackWith(null)
    var getDatabaseFactoryMock = simple.stub().returnWith('getDatabase')
    var appOptionsMock = simple.stub().returnWith({})
    var pouchDbConfigMock = simple.stub().callbackWith(null)
    var storeConfigMock = simple.stub().callbackWith(null)

    var getConfig = proxyquire('../../lib/config', {
      './account': accountConfigMock,
      './assure-folders': assureFolders,
      './db/couchdb': couchDbConfigMock,
      './db/factory': getDatabaseFactoryMock,
      './app-options': appOptionsMock,
      './db/pouchdb': pouchDbConfigMock,
      './store': storeConfigMock,
      'fs': {
        statSync: simple.stub().returnWith({
          isDirectory: simple.stub()
        })
      }
    })

    var PouchDBMock = function () {
      return {
        __opts: {}
      }
    }
    PouchDBMock.preferredAdapters = []

    getConfig(serverMock, {
      PouchDB: PouchDBMock
    }, function (error, config) {
      t.error(error)

      var state = {
        server: serverMock,
        inMemory: false,
        config: config,
        PouchDB: PouchDBMock,
        db: {
          options: {}
        }
      }

      t.is(pouchDbConfigMock.callCount, 0, 'PouchDB config not called')
      t.same(couchDbConfigMock.lastCall.arg, state, 'called couchdb config')
      t.same(accountConfigMock.lastCall.arg, state, 'called account config')
      t.same(storeConfigMock.lastCall.arg, state, 'called store config')

      t.end()
    })
  })

  group.end()
})
