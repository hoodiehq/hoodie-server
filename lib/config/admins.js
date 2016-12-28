module.exports = getAdmins

var internals = getAdmins.internals = {}
internals.Admins = require('pouchdb-admins').admins

function getAdmins (state, callback) {
  if (!state.config.adminPassword) {
    state.server.log(['account', 'warn'], 'Admin account disabled: `options.adminPassword` not set')
    state.admins = {}
    return process.nextTick(callback)
  }

  var admins = new internals.Admins({
    secret: state.secret
  })

  admins.set('admin', state.config.adminPassword)

  .then(function () {
    return admins.get('admin')
  })

  .then(function (doc) {
    state.admins = {
      admin: '-pbkdf2-' + doc.derived_key + ',' + doc.salt + ',10'
    }
    callback()
  })

  .catch(callback)
}
