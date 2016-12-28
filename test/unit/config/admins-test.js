var simple = require('simple-mock')
var test = require('tap').test

var getAdmins = require('../../../lib/config/admins')

test('admins config without adminPassword set', function (t) {
  var state = {
    server: {
      log: simple.stub()
    },
    config: {}
  }

  getAdmins(state, function () {
    t.same(state.admins, {}, 'admins are empty')

    simple.restore()
    t.end()
  })
})

test('admins config with adminPassword set', function (t) {
  var state = {
    server: {
      log: simple.stub()
    },
    config: {
      adminPassword: 'secret'
    }
  }
  var adminsApi = {
    get: simple.stub().resolveWith({derived_key: 'derived_key', salt: 'salt'}),
    set: simple.stub().resolveWith()
  }

  simple.mock(getAdmins.internals, 'Admins').returnWith(adminsApi)

  getAdmins(state, function () {
    t.same(state.admins, {
      admin: '-pbkdf2-derived_key,salt,10'
    }, 'sets admin account')
    t.is(adminsApi.set.callCount, 1, 'set admin account')

    simple.restore()
    t.end()
  })
})
