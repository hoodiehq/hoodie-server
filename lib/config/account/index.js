module.exports = accountConfig

var defaultsDeep = require('lodash').defaultsDeep

function accountConfig (state, callback) {
  defaultsDeep(state.config.account, {
    admins: state.admins,
    secret: state.secret,
    PouchDB: state.config.PouchDB,
    usersDb: '_users'
  })

  process.nextTick(function () {
    callback(null, state.config)
  })
}
