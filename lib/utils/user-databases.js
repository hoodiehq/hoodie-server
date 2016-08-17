/**
 * TODO: this functionality should be moved into hoodie-store-server. It should
 * expose an API at server.plugins.store.api the same way hoodie-account-server
 * does it: https://github.com/hoodiehq/hoodie-account-server/tree/master/api
 *
 * Right now it only works correctly if CouchDB is used for data. PouchDB
 * creates Databases when used for the first time, but databases get currently
 * not removed when a user account gets removed
 */
module.exports = {
  add: addUserDatabase,
  remove: removeUserDatabase
}

var format = require('util').format

var async = require('async')
var request = require('request')

function addUserDatabase (config, server, account) {
  server.log(['account', 'info'], format('created for %s (id: %s)', account.username, account.id))

  // databases & security only created if CouchDB used
  if (!config.store.couchdb) {
    return
  }

  async.series([
    createDatabase.bind(null, config, account),
    createSecurity.bind(null, config, account)
  ], function (error) {
    if (error) {
      server.log(['account', 'error'], format('user/%s not created: %s', account.id, error))
      return
    }

    server.log(['account', 'info'], format('database "user/%s" created for %s', account.id, account.username))
  })
}
function removeUserDatabase (config, server, account) {
  server.log(['account', 'info'], format('removed for %s (id: %s)', account.username, account.id))

  // databases & security only created if CouchDB used
  if (!config.store.couchdb) {
    return
  }

  deleteDatabase(config, account, function (error) {
    if (error) {
      server.log(['account', 'error'], format('account', 'user/%s not deleted: %s', account.id, error))
      return
    }

    server.log(['account', 'info'], format('database user/%s deleted for %s', account.id, account.username))
  })
}

function createDatabase (config, account, callback) {
  var url = config.store.couchdb + '/user%2f' + account.id
  request.put(url, callback)
}

function createSecurity (config, account, callback) {
  var url = config.store.couchdb + '/user%2f' + account.id + '/_security'
  var security = {
    admins: {
      names: [],
      roles: []
    },
    members: {
      names: [],
      roles: ['id:' + account.id]
    }
  }
  request({
    method: 'PUT',
    url: url,
    json: true,
    body: security
  }, callback)
}

function deleteDatabase (config, account, callback) {
  var url = config.store.couchdb + '/user%2f' + account.id
  request.del(url, callback)
}
