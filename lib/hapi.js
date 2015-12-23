var onStorePreAuth = require('./core-modules-glue-code/store-pre-auth')

module.exports = function (config, couchConfig, callback) {
  var database = require('./database')(config)
  var usersDb = database(couchConfig.authentication_db)

  usersDb.constructor.plugin(require('pouchdb-users'))

  var couchUrlWithoutAuth = removeAuth(config.db.url)

  usersDb.installUsersBehavior()
  .then(function () {
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
    }).concat([[{
      register: require('hoodie-server-account'),
      options: {
        admins: couchConfig.admins,
        config: config,
        database: database,
        usersDb: usersDb
      }
    }, {
      routes: {
        prefix: '/hoodie/account'
      }
    }], [{
      register: require('hoodie-server-store'),
      options: {
        couchdb: couchUrlWithoutAuth,
        hooks: {
          onPreAuth: onStorePreAuth
        }
      }
    }, {
      routes: {
        prefix: '/hoodie/store'
      }
    }]])))
  }, callback)
}

function removeAuth (couchUrl) {
  var parts = require('url').parse(couchUrl)
  return couchUrl.replace(parts.auth + '@', '')
}
