module.exports = assureFolders

var parallel = require('async').parallel
var mkdirp = require('mkdirp')
var url = require('url')

function assureFolders (state, callback) {
  if (state.inMemory) {
    return callback()
  }

  var tasks = [
    mkdirp.bind(null, state.config.paths.data)
  ]

  // if the prefix has a protocol like 'http', we assume that this is an external
  // prefix and we don't create the local folder to prevent accidental credential
  // leakage
  if (state.db.options.prefix && !url.parse(state.db.options.prefix).protocol) {
    tasks.push(mkdirp.bind(null, state.db.options.prefix))
  }

  parallel(tasks, callback)
}
