module.exports = getVendor

var findKey = require('lodash').findKey
var defaults = require('lodash').defaults

var toCouchDbUrl = require('../../utils/pouchdb-options-to-couchdb-url')
var removeAuth = require('../../utils/remove-auth-from-url')

function getVendor (state, couch, callback) {
  couch({url: '/'}, function (error, response, data) {
    if (error || (response && response.statusCode !== 200)) {
      var url = toCouchDbUrl(state.db.options)
      return callback(new Error('Could not find CouchDB at ' + removeAuth(url)))
    }

    var vendor = findType(data)
    if (!vendor) return callback(new Error('CouchDB server is not compatible with this version of hoodie-server'))

    if (vendor.type !== 'couchdb') {
      state.server.log(
        ['database', 'warn'],
        'You are not running an official CouchDB distribution, ' +
        'but "' + vendor.name + '". ' +
        'This might not be fully supported. Proceed at your own risk.'
      )
    }

    callback(null, vendor)
  })
}

function findType (data) {
  var isCouch = findKey(data, function (property) {
    return /^welcome/i.test(property)
  })

  // we need to be couchdb
  if (isCouch !== 'couchdb') return undefined

  // if vendor is not set, set a fallback
  data.vendor = defaults(data.vendor, {
    name: 'unknown',
    type: 'couchdb'
  })

  if (data.vendor.name === 'IBM Cloudant') data.vendor.type = 'cloudant'

  return data.vendor
}
