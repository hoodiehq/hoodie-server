var simple = require('simple-mock')
var test = require('tap').test

var accountConfig = require('../../../lib/config/account')

test('account config', function (t) {
  var dbStub = {
    installUsersBehavior: simple.stub().resolveWith()
  }
  var PouchDBMock = simple.stub().returnWith(dbStub)
  simple.mock(PouchDBMock, 'plugin').returnWith()

  accountConfig({
    db: {
      admins: 'db admins',
      secret: 'db secret'
    },
    config: {
      PouchDB: PouchDBMock,
      account: {}
    }
  }, function (error, config) {
    t.error(error)

    t.is(config.account.admins, 'db admins', 'sets config.account.admins')
    t.is(config.account.secret, 'db secret', 'sets config.account.secret')
    t.same(config.account.usersDb, dbStub, 'sets config.account.usersDb')

    t.end()
  })
})

test('account config installUsersBehavior error handling', function (t) {
  var dbStub = {
    installUsersBehavior: simple.stub().rejectWith(new Error('ooops'))
  }
  var PouchDBMock = simple.stub().returnWith(dbStub)
  simple.mock(PouchDBMock, 'plugin').returnWith()
  accountConfig({
    db: {
      admins: 'db admins',
      secret: 'db secret'
    },
    config: {
      PouchDB: PouchDBMock,
      account: {}
    }
  }, function (error, config) {
    t.ok(error)
    t.is(error.message, 'ooops')

    t.end()
  })
})
