module.exports = couchDbConfig

var async = require('async')
var request = require('request')

var checkVendor = require('./couchdb-check-vendor')
var getConfig = require('./couchdb-get-config')
var migrateToStoreDb = require('./couchdb-migrate-to-store-db')
var toCouchDbUrl = require('../../utils/pouchdb-options-to-couchdb-url')

function couchDbConfig (state, callback) {
  var couch = request.defaults({
    baseUrl: toCouchDbUrl(state.db.options),
    json: true
  })

  async.series([
    async.apply(checkVendor, state, couch),
    async.apply(migrateToStoreDb, state, couch),
    async.apply(getConfig, state, couch)
  ], function (error, results) {
    if (error) {
      return callback(error)
    }

    state.db.admins = results[2].admins
    state.db.secret = results[2].couch_httpd_auth.secret
    state.db.authenticationDb = results[2].couch_httpd_auth.authentication_db

    callback(null, state)
  })
}
