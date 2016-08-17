module.exports = assureFolders

var parallel = require('async').parallel
var mkdirp = require('mkdirp')

function assureFolders (state, callback) {
  if (state.inMemory) {
    return callback()
  }

  var tasks = [
    mkdirp.bind(null, state.config.paths.data)
  ]
  if (state.db.options.prefix) {
    tasks.push(mkdirp.bind(null, state.db.options.prefix))
  }

  parallel(tasks, callback)
}
