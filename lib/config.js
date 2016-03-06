var fs = require('fs')
var path = require('path')
var url = require('url')

var _ = require('lodash')
var log = require('npmlog')
var mkdirp = require('mkdirp')

module.exports = function (options) {
  var projectPath = options.path || process.cwd()

  var pkg = require(path.join(projectPath, 'package.json'))

  var config = {
    name: pkg.name,
    paths: {
      data: options.data || path.join(projectPath, 'data'),
      project: projectPath,
      public: options.public || path.join(projectPath, 'public')
    },
    db: {},
    admin: {},
    account: options.account || {}
  }

  var publicFolderExists
  try {
    publicFolderExists = fs.statSync(config.paths.public).isDirectory()
  } catch (err) {
    publicFolderExists = false
  }

  if (!publicFolderExists) {
    log.info('config', 'The "public" app path does not exist. Using hoodie-server/public.')
    config.paths.public = path.resolve(__dirname, '../public')
  }

  _.each(_.values(config.paths), _.ary(mkdirp.sync, 1))

  config.app = {
    hostname: options.bindAddress || '127.0.0.1',
    port: options.port || 8080,
    protocol: 'http'
  }

  if (options.dbUrl) {
    config.db.url = options.dbUrl
    if (!url.parse(options.dbUrl).auth) {
      log.warn('config', 'Authentication details missing from database URL')
    }
  } else {
    log.error('config', 'options.dbUrl must be set. PouchDB not supported at this point.')
    // log.warn('config', 'No database URL provided, falling back to PouchDB')
  }

  if (options.inMemory) {
    config.db.db = require('memdown')
  }

  return config
}
