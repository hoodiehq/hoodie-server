module.exports = onStorePreAuth

var Boom = require('boom')

/**
 * All requests to /hoodie/store are prefixed by user database names, which
 * are "user/{accountId}". `onStorePreAuth` checks the bearerToken if it is
 * a valid session Id, and if it belongs to the right user. If either fails,
 * it responds with an `unauthorized` error
 */
function onStorePreAuth (request, reply) {
  var server = request.connection.server
  var bearerToken = toBearerToken(request)

  if (!bearerToken) {
    return reply(Boom.unauthorized())
  }

  server.plugins.account.api.sessions.find(bearerToken)

  .then(function (session) {
    var accountId = session.account.id
    var isRequestToUserDb = request.path.indexOf(accountId) !== -1
    // PouchDB’s replication sends a GET to CouchDB root, I don’t know for what
    // reason. I let it go through to avoid a 401 ~@gr2m
    var isGetRootPath = request.path === '/hoodie/store/api/' && request.method === 'get'

    console.log("\nsession.id ==============================")
    console.log(session.id)
    console.log(__filename)

    console.log("\nsession.account.id ==============================")
    console.log(session.account.id)

    console.log("\nrequest.path ==============================")
    console.log(request.path)

    console.log("\nrequest.query ==============================")
    console.log(request.query)


    console.log("\naccountId ==============================")
    console.log(accountId)

    if (!isGetRootPath && !isRequestToUserDb) {
      throw new Error('unauthorized')
    }

    delete request.headers.authorization
    request.headers.cookie = 'AuthSession=' + session.id

    console.log("\nrequest.headers.cookie ==============================")
    console.log(request.headers.cookie)

    reply.continue()
  })

  .catch(function (error) {
    console.log("\nerror ==============================")
    console.log(error)
    console.log(__filename)

    reply(Boom.unauthorized())
  })
}

function toBearerToken (request) {
  var token
  if (request.headers.authorization) {
    token = request.headers.authorization.substring('Bearer '.length)
  }
  return token
}
