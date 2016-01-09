var onStorePreAuth = require('./core-modules-glue-code/store-pre-auth')

module.exports = function (config, couchConfig, callback) {
  var database = require('./database')(config)
  var usersDb = database(couchConfig.authentication_db)

  usersDb.constructor.plugin(require('pouchdb-users'))

  var couchUrlWithoutAuth = removeAuth(config.db.url)

  usersDb.installUsersBehavior()
  .then(function () {
    var options = {config, usersDb}

    var hapiPlugins = [
      require('h2o2'),
      require('inert'),
      require('vision'),
      require('lout')
    ]

    var localPlugins = [
      require('./http-log'),
      require('./static')
    ].map(function (register) { return {options, register} })

    var hoodieCorePlugins = [{
      register: require('hoodie-server-account'),
      options: {
        admins: couchConfig.admins,
        secret: config.db.secret,
        database: database,
        usersDb: usersDb,
        notifications: config.account.notifications
      },
      routes: {
        prefix: '/hoodie/account/api'
      }
    }, {
      register: require('hoodie-server-store'),
      options: {
        couchdb: couchUrlWithoutAuth,
        usersDb: usersDb,
        hooks: {
          onPreAuth: onStorePreAuth
        }
      },
      routes: {
        prefix: '/hoodie/store/api'
      }
    }]

    callback(null, hapiPlugins.concat(localPlugins, hoodieCorePlugins))
  })

  .catch(callback)
}

function removeAuth (couchUrl) {
  var parts = require('url').parse(couchUrl)
  return couchUrl.replace(parts.auth + '@', '')
}
