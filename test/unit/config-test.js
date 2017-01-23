var proxyquire = require('proxyquire').noCallThru()
var simple = require('simple-mock')
var test = require('tap').test

var serverMock = {
  on: function () {}
}

;[
  {
    name: 'config',
    preferredAdapters: ['test'],
    output: {inMemory: false}
  },
  {
    name: 'config with http adapter',
    preferredAdapters: [],
    output: {inMemory: false}
  },
  {
    name: 'config with memory adapter',
    preferredAdapters: ['memory'],
    output: {inMemory: true}
  }
].forEach(function (testConfig) {
  test(testConfig.name, function (group) {
    group.test('defaults', function (t) {
      var accountConfigMock = simple.stub().callbackWith(null)
      var adminsConfigMock = simple.stub().callbackWith(null)
      var couchDbConfigMock = simple.stub().callbackWith(null)
      var configPouchDbMock = simple.stub().callbackWith(null)
      var appOptionsMock = simple.stub().returnWith('app options')
      var secretConfigMock = simple.stub().callbackWith(null)
      var storeConfigMock = simple.stub().callbackWith(null)

      var getConfig = proxyquire('../../lib/config', {
        './account': accountConfigMock,
        './admins': adminsConfigMock,
        './app-options': appOptionsMock,
        './configure-pouchdb': configPouchDbMock,
        './secret': secretConfigMock,
        './store': storeConfigMock,
        'fs': {
          statSync: simple.stub().returnWith({
            isDirectory: simple.stub()
          })
        }
      })

      var PouchDBMock = simple.stub().returnWith({
        __opts: {}
      })
      PouchDBMock.preferredAdapters = testConfig.preferredAdapters
      PouchDBMock.plugin = simple.stub().returnWith(PouchDBMock)

      getConfig(serverMock, {
        PouchDB: PouchDBMock
      }, function (error, config) {
        t.error(error)

        var state = {
          server: serverMock,
          config: config,
          inMemory: testConfig.output.inMemory,
          PouchDB: PouchDBMock,
          db: {
            options: {}
          }
        }

        t.is(couchDbConfigMock.callCount, 0, 'couchdb config not called')
        t.same(configPouchDbMock.lastCall.arg, state, 'called config PouchDB')
        t.same(accountConfigMock.lastCall.arg, state, 'called account config')
        t.same(storeConfigMock.lastCall.arg, state, 'called store config')

        t.ok(configPouchDbMock.lastCall.k < secretConfigMock.lastCall.k, 'config PouchDB called before secret config')
        t.ok(secretConfigMock.lastCall.k < adminsConfigMock.lastCall.k, 'secret config called before admins config')
        t.ok(adminsConfigMock.lastCall.k < accountConfigMock.lastCall.k, 'admin config called before account config')
        t.ok(adminsConfigMock.lastCall.k < storeConfigMock.lastCall.k, 'admin config called before store config')

        t.end()
      })
    })

    group.end()
  })
})
