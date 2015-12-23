module.exports = function (config, usersDbName, callback) {
  var database = require('./database')(config)
  var usersDb = database(usersDbName)

  usersDb.constructor.plugin(require('pouchdb-users'))

  usersDb.installUsersBehavior().then(function () {
    var options = {config, usersDb}

    var hapiPlugins = [
      require('h2o2'),
      require('inert')
    ]

    var localPlugins = [
      require('./http-log'),
      require('./static')
    ].map(function (register) { return {options, register} })

    var hoodieCorePlugins = [{
      options,
      register: require('hoodie-server-account'),
      routes: {prefix: '/hoodie/account'}
    // }, {
    //   options,
    //   register: require('hoodie-server-store'),
    //   routes: {prefix: '/hoodie/store'}
    }]

    callback(null, hapiPlugins.concat(localPlugins, hoodieCorePlugins))
  }, callback)
}
