var simple = require('simple-mock')
var test = require('tap').test
var proxyquire = require('proxyquire').noCallThru()

test('generate couch config', function (group) {
  group.test('read from file', function (t) {
    var pouchDbConfig = proxyquire('../../../lib/config/db/pouchdb.js', {
      fs: {
        existsSync: function () {
          return true
        }
      },
      jsonfile: {
        readFileSync: function () {
          return {
            couch_httpd_auth_secret: 'a'
          }
        },
        writeFileSync: function () {}
      }
    })

    pouchDbConfig({
      db: {},
      config: {
        paths: {
          data: ''
        }
      }
    }, function (error, result) {
      t.error(error)
      t.is(result.db.secret, 'a')
      t.is(result.db.authenticationDb, '_users')
      t.end()
    })
  })

  group.test('writes config file', function (t) {
    var writeFileSyncStub = simple.stub()
    var pouchDbConfig = proxyquire('../../../lib/config/db/pouchdb.js', {
      fs: {
        existsSync: function () {
          return true
        }
      },
      jsonfile: {
        readFileSync: function () {
          return {
            admins: {
              admin: 'passwordhash'
            }
          }
        },
        writeFileSync: writeFileSyncStub
      },
      randomstring: {
        generate: function () {
          return 'randomstring'
        }
      }
    })

    pouchDbConfig({
      db: {},
      config: {
        paths: {
          data: ''
        }
      }
    }, function (error, result) {
      t.error(error)

      t.deepEqual(writeFileSyncStub.lastCall.args[1], {
        admins: {
          admin: 'passwordhash'
        },
        couch_httpd_auth_secret: 'randomstring'
      })

      t.end()
    })
  })

  group.test('generate and write to file', function (t) {
    var pouchDbConfig = proxyquire('../../../lib/config/db/pouchdb.js', {
      fs: {
        existsSync: function () {
          return false
        }
      },
      jsonfile: {
        writeFileSync: function () {}
      }
    })

    pouchDbConfig({
      db: {},
      config: {
        paths: {
          data: ''
        }
      }
    }, function (error, result) {
      t.error(error)
      t.is(result.db.secret.length, 32)
      t.is(result.db.authenticationDb, '_users')
      t.end()
    })
  })

  group.test('error handling', function (t) {
    var pouchDbConfig = proxyquire('../../../lib/config/db/pouchdb.js', {
      fs: {
        existsSync: function () {
          return false
        }
      },
      jsonfile: {
        writeFileSync: function () {}
      },
      'pouchdb-admins': {
        admins: function () {
          return {
            set: function () {
              return Promise.reject(new Error('ooops'))
            }
          }
        }
      }
    })

    pouchDbConfig({
      db: {},
      config: {
        paths: {
          data: ''
        }
      }
    }, function (error, result) {
      t.ok(error, 'callsback with error')
      t.is(error.message, 'ooops', 'callsback with error admins.set promise rejected with')
      t.end()
    })
  })

  group.end()
})
