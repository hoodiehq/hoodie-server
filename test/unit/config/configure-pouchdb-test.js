var simple = require('simple-mock')
var test = require('tap').test

var configurePouchDB = require('../../../lib/config/configure-pouchdb')

test('pouchdb config', function (t) {
  var docApiStub = simple.stub().returnWith('hoodie-config-db')
  var PouchDBMock = simple.stub().returnWith({
    doc: docApiStub
  })
  var state = {
    db: {},
    PouchDB: PouchDBMock
  }

  configurePouchDB(state, function (error) {
    t.error(error)

    t.is(PouchDBMock.calls.length, 1, 'PouchDB constructor called once')
    t.is(PouchDBMock.lastCall.arg, 'hoodie-config', 'PouchDB constructor called with \'hoodie-config\'')
    t.is(docApiStub.calls.length, 1, 'PouchDB\'s doc method called once')
    t.is(docApiStub.lastCall.arg, 'hoodie', 'doc method called with \'hoodie\'')

    t.is(state.db.config, 'hoodie-config-db', 'config key in state.db set')

    t.end()
  })
})
