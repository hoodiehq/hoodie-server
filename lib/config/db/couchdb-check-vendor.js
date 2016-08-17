module.exports = checkVendor

var findKey = require('lodash').findKey

var toCouchDbUrl = require('../../utils/pouchdb-options-to-couchdb-url')
var removeAuth = require('../../utils/remove-auth-from-url')

function checkVendor (state, couch, callback) {
  couch({url: '/'}, function (error, response, data) {
    if (error || (response && response.statusCode !== 200)) {
      var url = toCouchDbUrl(state.db.options)
      return callback(new Error('Could not find CouchDB at ' + removeAuth(url)))
    }

    var vendor = findKey(data, function (property) {
      return /^welcome/i.test(property)
    })

    if (vendor !== 'couchdb') {
      state.server.log(
        ['database', 'warn'],
        'You are not running an official CouchDB distribution, ' +
        'but "' + vendor + '". ' +
        'This might not be fully supported. Proceed at your own risk.'
      )
    }

    callback(null)
  })
}
