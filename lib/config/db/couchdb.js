module.exports = couchDbConfig

var async = require('async')
var request = require('request')

var checkVendor = require('./couchdb-check-vendor')
var getAdmins = require('./couchdb-get-admins')
var getConfig = require('./couchdb-get-config')
var toCouchDbUrl = require('../../utils/pouchdb-options-to-couchdb-url')

function couchDbConfig (state, callback) {
  var couch = request.defaults({
    baseUrl: toCouchDbUrl(state.db.options),
    json: true
  })

  async.series([
    async.apply(checkVendor, state, couch),
    async.apply(getConfig, couch),
    async.apply(getAdmins, couch)
  ], function (error, results) {
    if (error) {
      return callback(error)
    }

    state.db.admins = results[2]
    state.db.secret = results[1].secret

    callback(null, state)
  })
}
