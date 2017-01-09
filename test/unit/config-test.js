var proxyquire = require('proxyquire').noCallThru()
var simple = require('simple-mock')
var test = require('tap').test

var serverMock = {
  on: function () {}
}

;[
  {name: 'config', preferredAdapters: ['test']},
  {name: 'config with http adapter', preferredAdapters: []}
].forEach(function (testConfig) {
  test(testConfig.name, function (group) {
    group.test('defaults', function (t) {
      var accountConfigMock = simple.stub().callbackWith(null)
      var adminsConfigMock = simple.stub().callbackWith(null)
      var assureFolders = simple.stub().callbackWith(null)
      var couchDbConfigMock = simple.stub().callbackWith(null)
      var appOptionsMock = simple.stub().returnWith('app options')
      var secretConfigMock = simple.stub().callbackWith(null)
      var storeConfigMock = simple.stub().callbackWith(null)

      var getConfig = proxyquire('../../lib/config', {
        './account': accountConfigMock,
        './assure-folders': assureFolders,
        './admins': adminsConfigMock,
        './app-options': appOptionsMock,
        './secret': secretConfigMock,
        './store': storeConfigMock,
        'fs': {
          statSync: simple.stub().returnWith({
            isDirectory: simple.stub()
          })
        }
      })

      var docApiStub = simple.stub()
      var PouchDBMock = simple.stub().returnWith({
        __opts: {},
        doc: docApiStub
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
          inMemory: false,
          PouchDB: PouchDBMock,
          db: {
            config: docApiStub(),
            options: {}
          }
        }

        t.is(couchDbConfigMock.callCount, 0, 'couchdb config not called')
        t.same(accountConfigMock.lastCall.arg, state, 'called account config')
        t.same(storeConfigMock.lastCall.arg, state, 'called store config')

        var pouchDbConstructorConfigCalls = PouchDBMock.calls.filter(function (item) {
          return item.arg === 'hoodie-config'
        })
        t.equal(pouchDbConstructorConfigCalls.length, 1, 'PouchDB constructor for \'hoodie-config\' called once')
        t.ok(
          assureFolders.lastCall.k < pouchDbConstructorConfigCalls[0].k,
          'assure folders called before PouchDB constructor for \'hoodie-config\''
        )
        t.ok(secretConfigMock.lastCall.k < adminsConfigMock.lastCall.k, 'secret config called before admins config')
        t.ok(adminsConfigMock.lastCall.k < accountConfigMock.lastCall.k, 'admin config called before account config')
        t.ok(adminsConfigMock.lastCall.k < storeConfigMock.lastCall.k, 'admin config called before store config')

        t.end()
      })
    })

    group.end()
  })
})
