var test = require('tap').test

var accountConfig = require('../../../lib/config/account')

test('account config', function (t) {
  var state = {
    admins: 'admins',
    secret: 'secret',
    config: {
      PouchDB: 'PouchDB',
      account: {}
    }
  }
  accountConfig(state, function (error, config) {
    t.error(error)

    t.is(config.account.admins, 'admins', 'sets config.account.admins')
    t.is(config.account.secret, 'secret', 'sets config.account.secret')
    t.is(config.account.usersDb, '_users', 'sets config.account.usersDb')
    t.is(config.account.PouchDB, 'PouchDB', 'sets config.account.PouchDB')

    t.end()
  })
})
