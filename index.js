module.exports.register = register
module.exports.register.attributes = {
  name: 'hoodie-server'
}

var format = require('util').format

var getConfig = require('./lib/config')
var registerPlugins = require('./lib/plugins')

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
      server.plugins.account.api.accounts.on('add', function (account) {
        server.log(['account', 'info'], format('created for %s (id: %s)', account.username, account.id))

        server.plugins.store.api.create('user/' + account.id, {
          access: ['read', 'write'],
          role: ['id:' + account.id]
        })

        .then(function (dbName) {
          server.log(['store', 'info'], format('database %s created', dbName))
        })
      })
      server.plugins.account.api.accounts.on('remove', function (account) {
        server.log(['account', 'info'], format('removed for %s (id: %s)', account.username, account.id))

        server.plugins.store.api.destroy('user/' + account.id)

        .then(function (dbName) {
          server.log(['store', 'info'], format('database %s destroyed', dbName))
        })
      })

      next(null, server, config)
    })
  })
}
