var async = require('async')
var hapi = require('hapi')
var log = require('npmlog')

var userDatabases = require('./core-modules-glue-code/user-databases')

module.exports = function (options, callback) {
  'use strict'

  log.level = options.loglevel || 'warn'

  var config = require('./config')(options)

  var hapiConfig = {}

  if (log.level === 'debug') {
    hapiConfig = {
      debug: {
        request: ['error'],
        log: ['error']
      }
    }
  }

  var server = new hapi.Server(hapiConfig)

  require('./couchdb')(config, function (err, couchConfig) {
    /* istanbul ignore next */
    if (err) return callback(err)

    config.db.secret = couchConfig.secret

    server.connection({
      host: config.app.hostname,
      port: config.app.port,
      routes: {
        cors: {
          credentials: true
        }
      }
    })

    log.silly('hapi', 'Registering internal plugins')

    require('./hapi')(config, couchConfig, function (err, plugins) {
      /* istanbul ignore next */
      if (err) return callback(err)

      var registerFunctions = plugins.map(function (config) {
        if (Array.isArray(config)) {
          return server.register.bind(server, config[0], config[1])
        }

        return server.register.bind(server, config)
      })

      async.series(registerFunctions, function (error) {
        if (error) {
          return callback(error)
        }

        log.error('Databases not created/deleted for accounts: server.plugins.account.api.accounts.on not yet implemented')
        server.plugins.account.api.accounts.on = function () {}
        server.plugins.account.api.accounts.on('add', userDatabases.add.bind(null, server))
        server.plugins.account.api.accounts.on('remove', userDatabases.remove.bind(null, server))

        callback(null, server, config)
      })
    })
  })
}
