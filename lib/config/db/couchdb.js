module.exports = couchDbConfig

var async = require('async')
var request = require('request')

var getVendor = require('./couchdb-get-vendor')
var getAdmins = require('./couchdb-get-admins')
var getConfig = require('./couchdb-get-config')
var migrateToStoreDb = require('./couchdb-migrate-to-store-db')
var setConfig = require('./couchdb-set-config')
var toCouchDbUrl = require('../../utils/pouchdb-options-to-couchdb-url')

function couchDbConfig (state, callback) {
  var couch = request.defaults({
    baseUrl: toCouchDbUrl(state.db.options),
    json: true
  })

  getVendor(state, couch, function (error, vendor) {
    if (error) {
      return callback(error)
    }

    var tasks = [
      async.apply(migrateToStoreDb, state, couch)
    ]

    if (vendor.type === 'couchdb') {
      tasks = tasks.concat([
        async.apply(setConfig, couch),
        async.apply(getConfig, couch),
        async.apply(getAdmins, couch)
      ])
    }

    async.series(tasks, function (error, results) {
      if (error) {
        return callback(error)
      }

      if (vendor.type === 'couchdb') {
        state.db.admins = results[3]
        state.db.secret = results[2].secret
        state.db.authenticationDb = results[2].authentication_db
      }

      if (vendor.type === 'cloudant') {
        state.db.authenticationDb = '_users'
      }

      callback(null, state)
    })
  })
}
