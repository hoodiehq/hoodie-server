var simple = require('simple-mock')
var test = require('tap').test
var proxyquire = require('proxyquire').noCallThru()

test('index', function (group) {
  group.test('binds account event handlers to create / destory user databases', function (t) {
    var addUserDatabaseStub = simple.stub()
    var removeUserDatabaseStub = simple.stub()
    var onAccountEventStub = simple.stub()
    var config = {}
    var server = {
      plugins: {
        account: {
          api: {
            accounts: {
              on: onAccountEventStub
            }
          }
        }
      }
    }
    var hapiPlugin = proxyquire('../../index', {
      './lib/config': simple.stub().callbackWith(null, config),
      './lib/plugins': simple.stub().callbackWith(null),
      './lib/utils/user-databases': {
        add: addUserDatabaseStub,
        remove: removeUserDatabaseStub
      }
    }).register

    hapiPlugin(server, config, function (error) {
      t.error(error)

      t.is(onAccountEventStub.callCount, 2, 'accounts.on called twice')
      t.is(onAccountEventStub.calls[0].args[0], 'add')
      t.is(onAccountEventStub.calls[1].args[0], 'remove')

      var addHandler = onAccountEventStub.calls[0].args[1]
      var removeHandler = onAccountEventStub.calls[1].args[1]

      addHandler('foo')
      removeHandler('bar')

      t.deepEqual(addUserDatabaseStub.lastCall.args, [config, server, 'foo'])
      t.deepEqual(removeUserDatabaseStub.lastCall.args, [config, server, 'bar'])

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
