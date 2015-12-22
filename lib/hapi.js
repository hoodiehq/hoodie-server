// var _ = require('lodash')

module.exports = function (config, couchConfig, callback) {
  var database = require('./database')(config)
  var usersDb = database(couchConfig.authentication_db)

  usersDb.constructor.plugin(require('pouchdb-users'))

  usersDb.installUsersBehavior()
  .then(function () {
    var defaultOpts = {
      admins: couchConfig.admins,
      config: config,
      database: database,
      prefix: '/hoodie/account',
      usersDb: usersDb
    }

    callback(null, [
      require('inert'),
      require('h2o2')
    ].concat([
      require('./static'),
      require('./http-log')
    ].map(function (plugin) {
      return {
        register: plugin,
        options: {config: config}
      }
    }), {
      register: require('hoodie-server-account'),
      options: defaultOpts
    // }, {
    //   register: require('hoodie-server-store'),
    //   options: _.defaults({prefix: '/hoodie/store'}, defaultOpts)
    }))
  }, callback)
}
