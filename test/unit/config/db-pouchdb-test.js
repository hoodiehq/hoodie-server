var proxyquire = require('proxyquire').noCallThru()
var simple = require('simple-mock')
var test = require('tap').test

test('generate couch config', function (group) {
  group.test('read admins from file, get secret from config', function (t) {
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
              admin: 'foo'
            }
          }
        },
        writeFileSync: function () {}
      },
      './get-secret': simple.stub().callbackWith(null, 'secret')
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

      t.is(result.db.secret, 'secret')
      t.end()
    })
  })

  group.test('generate and write admins to file', function (t) {
    var pouchDbConfig = proxyquire('../../../lib/config/db/pouchdb.js', {
      fs: {
        existsSync: function () {
          return false
        }
      },
      jsonfile: {
        writeFileSync: function () {}
      },
      './get-secret': simple.stub().callbackWith(null, 'secret')
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
      t.ok(/^-pbkdf2-/.test(result.db.admins.admin))
      t.end()
    })
  })

  group.test('file error handling', function (t) {
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
      },
      './get-secret': simple.stub().callbackWith(null, 'secret')
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

  group.test('config error handling', function (t) {
    var pouchDbConfig = proxyquire('../../../lib/config/db/pouchdb.js', {
      fs: {
        existsSync: function () {
          return false
        }
      },
      './get-secret': simple.stub().callbackWith(new Error('ooops'))
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
