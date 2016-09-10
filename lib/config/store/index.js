module.exports = storeConfig

var storePreAuthHook = require('./pre-auth-hook')

function storeConfig (state, callback) {
  state.config.store.hooks = {
    onPreAuth: storePreAuthHook
  }

  state.config.store.PouchDB = state.config.PouchDB

  callback(null, state.config)
}
