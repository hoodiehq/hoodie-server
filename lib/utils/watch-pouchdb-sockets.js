module.exports = watchPouchDbSockets

// see https://github.com/hoodiehq/hoodie-server/issues/521

/* istanbul ignore next */
function watchPouchDbSockets (PouchDB) {
  var sockets = []

  PouchDB.prototype.changes = (function (originalChanges) {
    return function changesPatchedForHoodie (options) {
      var changes = originalChanges.apply(this, [options])
      if (options.live || options.continuous) {
        sockets.push(changes)
      }
      return changes
    }
  })(PouchDB.prototype.changes)
  PouchDB.replicate = (function (originalReplicate) {
    return function replicationPatchedForHoodie (source, target, options) {
      var changes = originalReplicate.apply(this, [source, target, options])
      if (options.live || options.continuous) {
        sockets.push(changes)
      }
      return changes
    }
  })(PouchDB.replicate)

  return sockets
}
