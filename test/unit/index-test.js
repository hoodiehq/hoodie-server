var simple = require('simple-mock')
var test = require('tap').test
var proxyquire = require('proxyquire').noCallThru()

test('index', function (group) {
  group.test('binds account event handlers to create / destory user databases', function (t) {
    var onAccountEventStub = simple.stub()
    var createStoreStub = simple.stub().resolveWith('created-db')
    var destroyStoreStub = simple.stub().resolveWith('destroyed-db')
    var config = {}
    var server = {
      log: function () {},
      plugins: {
        account: {
          api: {
            accounts: {
              on: onAccountEventStub
            }
          }
        },
        store: {
          api: {
            create: createStoreStub,
            destroy: destroyStoreStub
          }
        }
      }
    }
    var hapiPlugin = proxyquire('../../index', {
      './lib/config': simple.stub().callbackWith(null, config),
      './lib/plugins': simple.stub().callbackWith(null)
    }).register

    hapiPlugin(server, config, function (error) {
      t.error(error)

      t.is(onAccountEventStub.callCount, 2, 'accounts.on called twice')
      t.is(onAccountEventStub.calls[0].args[0], 'add')
      t.is(onAccountEventStub.calls[1].args[0], 'remove')

      var addHandler = onAccountEventStub.calls[0].args[1]
      var removeHandler = onAccountEventStub.calls[1].args[1]

      addHandler({id: 'foo'})
      removeHandler({id: 'bar'})

      t.deepEqual(createStoreStub.lastCall.args, ['user/foo', {
        access: ['read', 'write'],
        role: ['id:foo']
      }])
      t.deepEqual(destroyStoreStub.lastCall.args, ['user/bar'])

      t.end()
    })
  })

  group.test('config error', function (t) {
    var hapiPlugin = proxyquire('../../index', {
      './lib/config': simple.stub().callbackWith(new Error('ooops'))
    }).register

    hapiPlugin({}, {}, function (error) {
      t.ok(error, 'calls back with error')
      t.is(error.message, 'ooops', 'calls back with error from lib/config')

      t.end()
    })
  })

  group.test('plugins error', function (t) {
    var hapiPlugin = proxyquire('../../index', {
      './lib/config': simple.stub().callbackWith(null, {}),
      './lib/plugins': simple.stub().callbackWith(new Error('ooops'))
    }).register

    hapiPlugin({}, {}, function (error) {
      t.ok(error, 'calls back with error')
      t.is(error.message, 'ooops', 'calls back with error from lib/plugins')

      t.end()
    })
  })

  group.end()
})
