module.exports = storeConfig

var storePreAuthHook = require('./pre-auth-hook')
var toCouchDbUrl = require('../../utils/pouchdb-options-to-couchdb-url')

function storeConfig (state, callback) {
  state.config.store.hooks = {
    onPreAuth: storePreAuthHook
  }

  var couchDbUrl = toCouchDbUrl(state.db.options)

  if (couchDbUrl) {
    state.config.store.couchdb = couchDbUrl
  } else {
    state.config.store.PouchDB = state.config.PouchDB
  }

  callback(null, state.config)
}
