module.exports = toCouchDbUrl

var url = require('url')
var get = require('lodash').get

function toCouchDbUrl (pouchDbOptions) {
  if (!get(pouchDbOptions, 'prefix')) {
    return
  }

  var uri = url.parse(pouchDbOptions.prefix)

  if (uri.protocol !== 'http:' && uri.protocol !== 'https:') {
    return
  }

  if (!uri.auth && pouchDbOptions.auth) {
    uri.auth = pouchDbOptions.auth.username + ':' + pouchDbOptions.auth.password
  }

  return url.format(uri)
}
