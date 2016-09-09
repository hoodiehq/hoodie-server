module.exports = registerPlugins

function registerPlugins (server, config, callback) {
  var hapiPlugins = [
    require('h2o2'),
    require('inert'),
    require('vision')
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

  server.log(['hapi', 'silly'], 'Registering hoodie core plugins')
  server.register(plugins, function (error) {
    if (error) {
      return callback(error)
    }

    server.log(['hapi', 'info'], 'hoodie core plugins registered')
    callback(null)
  })
}
