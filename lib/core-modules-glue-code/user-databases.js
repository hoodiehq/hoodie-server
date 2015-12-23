module.exports = {
  add: addUserDatabase,
  remove: removeUserDatabase
}

var log = require('npmlog')

function addUserDatabase (server, account) {
  log.info('Account created for %s (id: %s)', account.username, account.id)
  log.error('user/%s not created: not yet implemented (/lib/core-modules-glue-code/user-databases.js)', account.id)
}
function removeUserDatabase (server, account) {
  log.info('Account removed for %s (id: %s)', account.username, account.id)
  log.error('user/%s not deleted: not yet implemented (/lib/core-modules-glue-code/user-databases.js)', account.id)
}
