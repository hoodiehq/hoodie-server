module.exports = getConfig

var statSync = require('fs').statSync
var path = require('path')

var defaultsDeep = require('lodash').defaultsDeep
var PouchDBDocApi = require('pouchdb-doc-api')
var series = require('async').series

var accountConfig = require('./account')
var configurePouchDb = require('./configure-pouchdb')
var getAdmins = require('./admins')
var getDefaults = require('./defaults')
var getSecret = require('./secret')
var storeConfig = require('./store')

var watchPouchDbSockets = require('../utils/watch-pouchdb-sockets')

function getConfig (server, config, callback) {
  defaultsDeep(config, getDefaults())

  // fallback to http, see https://github.com/pouchdb/pouchdb/issues/5567
  var adapter = config.PouchDB.preferredAdapters[0] || 'http'

  // http://npm.im/pouchdb-doc-api
  config.PouchDB.plugin(PouchDBDocApi)

  var state = {
    inMemory: adapter === 'memory',
    config: config,
    server: server,
    PouchDB: config.PouchDB,
    db: {
      // TODO: remove hack once .options is exposed:
      // https://github.com/pouchdb/pouchdb/issues/5548
      options: new config.PouchDB('hack', {skip_setup: true}).__opts
    }
  }

  // see https://github.com/hoodiehq/hoodie-server/issues/521
  var sockets = watchPouchDbSockets(state.PouchDB)
  server.on('stop', function () {
    sockets.forEach(function (socket) {
      socket.cancel()
    })
  })

  // check if app has public folder. Fallback to Hoodie’s public folder if not
  try {
    statSync(config.paths.public).isDirectory()
  } catch (error) {
    config.paths.public = path.resolve(__dirname, '../../lib/public')
    server.log(['config', 'info'], 'The "public" app path does not exist. Serving ' + config.paths.public)
  }

  series([
    configurePouchDb.bind(null, state),
    getSecret.bind(null, state),
    getAdmins.bind(null, state),
    accountConfig.bind(null, state),
    storeConfig.bind(null, state)
  ], function (error) {
    callback(error, state.config)
  })
}
