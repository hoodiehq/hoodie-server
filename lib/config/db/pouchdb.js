module.exports = pouchDbConfig

var existsSync = require('fs').existsSync
var join = require('path').join

// pouchdb-admins is made to be a PouchDB plugin but does not require a db,
// so can be used standalone
var Admins = require('pouchdb-admins').admins
var get = require('lodash/get')
var jsonfile = require('jsonfile')

var getSecret = require('./get-secret')

function pouchDbConfig (state, callback) {
  var storePath = join(state.config.paths.data, 'config.json')
  var storeExists = existsSync(storePath)

  var store = storeExists && jsonfile.readFileSync(storePath, {
    throws: false
  }) || {}
  var adminPassword = get(store, 'admins.admin')

  state.db.admins = store.admins

  getSecret(state, function (error, secret) {
    if (error) {
      return callback(error)
    }

    state.db.secret = secret

    if (adminPassword) {
      return callback(null, state)
    }

    var admins = new Admins({
      secret: secret
    })

    admins.set('admin', 'secret')

    .then(function () {
      return admins.get('admin')
    })

    .then(function (doc) {
      state.db.admins = {
        admin: '-pbkdf2-' + doc.derived_key + ',' + doc.salt + ',10'
      }

      if (!state.inMemory) {
        jsonfile.writeFileSync(storePath, Object.assign(store, {
          couch_httpd_auth_secret: secret,
          admins: state.db.admins
        }), {spaces: 2})
      }

      process.nextTick(function () {
        callback(null, state)
      })
    })

    .catch(function (error) {
      callback(error)
    })
  })
}
