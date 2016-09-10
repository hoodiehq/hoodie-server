module.exports = onStorePreAuth

var Boom = require('boom')

/**
 * All requests to /hoodie/store are prefixed by user database names, which
 * are "user/{accountId}". `onStorePreAuth` checks if the sessionToken is
 * a valid session Id, and if it belongs to the right user. If either fails,
 * it responds with an `unauthorized` error
 *
 * See https://github.com/hoodiehq/hoodie-store-server#optionshooks
 */
function onStorePreAuth (request, reply) {
  var server = request.connection.server
  var sessionToken = toSessionToken(request)

  if (!sessionToken) {
    return reply(Boom.unauthorized())
  }

  server.plugins.account.api.sessions.find(sessionToken)

  .then(function (session) {
    // PouchDB’s replication sends an initial GET to CouchDB root initially
    var isGetRootPath = request.path === '/hoodie/store/api/' && request.method === 'get'
    var requiredAccess = request.method === 'get' ? 'read' : 'write'

    delete request.headers.authorization
    request.headers.cookie = 'AuthSession=' + session.id

    if (isGetRootPath) {
      return reply.continue()
    }

    var storePath = request.path.substr('/hoodie/store/api/'.length)
    var dbPath = storePath.split('/')[0]
    var dbName = decodeURIComponent(dbPath)
    var roles = session.account.roles.concat('id:' + session.account.id)

    return server.plugins.store.api.hasAccess(dbName, {
      access: requiredAccess,
      role: roles
    })

    .then(function (hasAccess) {
      if (hasAccess) {
        return reply.continue()
      }

      reply(Boom.unauthorized())
    })

    .catch(function (error) {
      throw error
    })
  })

  .catch(function (error) {
    if (error.status === 404) { // session not found
      return reply(Boom.unauthorized())
    }

    server.log(['store', 'error'], error.message)
    reply(Boom.wrap(error, 500))
  })
}

function toSessionToken (request) {
  var token
  if (request.headers.authorization) {
    token = request.headers.authorization.substring('Session '.length)
  }
  return token
}
