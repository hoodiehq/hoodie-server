module.exports = registerPlugins

var log = require('npmlog')

function registerPlugins (server, config, callback) {
  var hapiPlugins = [
    require('h2o2'),
    require('inert'),
    require('vision'),
    require('lout')
  ]
  var hoodieCorePlugins = ['account', 'store'].map(function (name) {
    return {
      register: require('@hoodie/' + name + '-server'),
      options: config[name],
      routes: {
        prefix: '/hoodie/' + name + '/api'
      }
    }
  })
  var plugins = hapiPlugins.concat(hoodieCorePlugins)

  log.silly('hapi', 'Registering hoodie core plugins')
  server.register(plugins, function (error) {
    if (error) {
      return callback(error)
    }

    log.info('hapi', 'hoodie core plugins registered')
    callback(null)
  })
}
