module.exports = getConfig

var statSync = require('fs').statSync
var path = require('path')

var defaultsDeep = require('lodash').defaultsDeep
var series = require('async').series

var accountConfig = require('./account')
var assureFolders = require('./assure-folders')
var couchDbConfig = require('./db/couchdb')
var getDefaults = require('./defaults')
var pouchDbConfig = require('./db/pouchdb')
var storeConfig = require('./store')

function getConfig (server, config, callback) {
  defaultsDeep(config, getDefaults())

  // fallback to http, see https://github.com/pouchdb/pouchdb/issues/5567
  var adapter = config.PouchDB.preferredAdapters[0] || 'http'

  var dbConfig = adapter === 'http' ? couchDbConfig : pouchDbConfig
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

  // check if app has public folder. Fallback to Hoodie’s public folder if not
  try {
    statSync(config.paths.public).isDirectory()
  } catch (error) {
    config.paths.public = path.resolve(__dirname, '../../lib/public')
    server.log(['config', 'info'], 'The "public" app path does not exist. Serving ' + config.paths.public)
  }

  series([
    assureFolders.bind(null, state),
    dbConfig.bind(null, state),
    accountConfig.bind(null, state),
    storeConfig.bind(null, state)
  ], function (error) {
    callback(error, state.config)
  })
}
