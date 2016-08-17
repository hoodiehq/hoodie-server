module.exports = accountConfig

var defaultsDeep = require('lodash').defaultsDeep
var pouchDbUsers = require('pouchdb-users')

function accountConfig (state, callback) {
  state.config.PouchDB.plugin(pouchDbUsers)

  var usersDb = new state.config.PouchDB(state.db.authenticationDb)
  usersDb.installUsersBehavior()

  .then(function () {
    defaultsDeep(state.config.account, {
      admins: state.db.admins,
      secret: state.db.secret,
      usersDb: usersDb
    })

    process.nextTick(function () {
      callback(null, state.config)
    })
  })

  .catch(function (error) {
    callback(error, state.config)
  })
}
