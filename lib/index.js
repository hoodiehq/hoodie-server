var async = require('async')
var hapi = require('hapi')
var log = require('npmlog')

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

        log.verbose('hapi', 'Registered internal plugins')
        callback(null, server, config)
      })
    })
  })
}
