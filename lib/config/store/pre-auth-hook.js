module.exports = onStorePreAuth

var Boom = require('boom')

/**
 * First we check if the database is publically accessible for read or write,
 * depending on the request. If it is not, we load the user’s session and check
 * if their account has access to the database based on their account id and roles.
 *
 * See https://github.com/hoodiehq/hoodie-store-server#optionshooks
 */
function onStorePreAuth (request, reply) {
  var server = request.connection.server

  // PouchDB’s replication sends an initial GET to CouchDB root initially
  var isGetRootPath = request.path === '/hoodie/store/api/' && request.method === 'get'
  if (isGetRootPath) {
    return new Promise(function (resolve) {
      resolve(reply.continue())
    })
  }

  // check if store is publically accessable
  var storePath = request.path.substr('/hoodie/store/api/'.length)
  var dbPath = storePath.split('/')[0]
  var dbName = decodeURIComponent(dbPath)
  var requiredAccess = isRead(request) ? 'read' : 'write'

  return server.plugins.store.api.hasAccess(dbName, {
    access: requiredAccess
  })

  .then(function (hasAccess) {
    if (hasAccess) {
      return throwContinue('You have permissions for DB access')
    }

    var sessionToken = toSessionToken(request)
    if (!sessionToken) {
      return throwUnauthorized('No session token given')
    }

    return server.plugins.account.api.sessions.find(sessionToken)
  })

  .then(function (session) {
    delete request.headers.authorization
    request.headers.cookie = 'AuthSession=' + session.id

    var roles = session.account.roles.concat('id:' + session.account.id, 'user')

    return server.plugins.store.api.hasAccess(dbName, {
      access: requiredAccess,
      role: roles
    })
  })

  .then(function (hasAccess) {
    if (hasAccess) {
      return throwContinue('Given session has permissions for DB access')
    }

    return throwUnauthorized('No access to database at requested level with given roles')
  })

  .catch(function (error) {
    if (error.status === 404 || error.status === 401) { // session not found
      return reply(Boom.unauthorized())
    }

    if (error.status === 201) { // continue
      return reply.continue()
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

function isRead (request) {
  if (request.method === 'get') {
    return true
  }

  // POST db/_all_docs is still a read request
  if (/^\/hoodie\/store\/api\/[^/]+\/_all_docs$/.test(request.path)) {
    return true
  }

  return false
}

function throwContinue (message) {
  throwResponse(message, 201)
}

function throwUnauthorized (message) {
  throwResponse(message, 401)
}

function throwResponse (message, errorCode) {
  var response = new Error(message)
  response.status = errorCode
  throw response
}
