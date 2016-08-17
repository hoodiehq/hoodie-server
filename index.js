module.exports.register = register
module.exports.register.attributes = {
  name: 'hoodie-server'
}

var getConfig = require('./lib/config')
var registerPlugins = require('./lib/plugins')
var userDatabases = require('./lib/utils/user-databases')

function register (server, options, next) {
  getConfig(server, options, function (error, config) {
    if (error) {
      return next(error)
    }

    registerPlugins(server, config, function (error) {
      if (error) {
        return next(error)
      }

      // add / remove user databases on signups / account deletions
      server.plugins.account.api.accounts.on('add', userDatabases.add.bind(null, config, server))
      server.plugins.account.api.accounts.on('remove', userDatabases.remove.bind(null, config, server))

      next(null, server, config)
    })
  })
}
