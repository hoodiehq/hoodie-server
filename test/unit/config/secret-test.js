var simple = require('simple-mock')
var test = require('tap').test

var getSecret = require('../../../lib/config/secret')

test('secret config without secret already set', function (t) {
  var state = {
    db: {
      config: {
        get: simple.stub().resolveWith({secret: 'secret'})
      }
    }
  }

  getSecret(state, function (error) {
    t.error(error)
    t.is(state.secret, 'secret', 'sets secret from config')

    simple.restore()
    t.end()
  })
})

test('secret config without secret already set', function (t) {
  var state = {
    db: {
      config: {
        get: simple.stub().resolveWith({}),
        set: simple.stub().resolveWith()
      }
    }
  }

  simple.mock(getSecret.internals.randomstring, 'generate').returnWith('newsecret')

  getSecret(state, function (error) {
    t.error(error)
    t.is(state.secret, 'newsecret', 'sets secret from config')
    t.is(state.db.config.set.callCount, 1, 'writes config')

    simple.restore()
    t.end()
  })
})
