module.exports = getConfig

var defaults = require('lodash').defaults

function getConfig (state, couch, callback) {
  getCurrentConfig(couch, function (error, config) {
    if (error) state.server.log(['database', 'warn'], 'Could not get CouchDB values from `/_config`. Using defaults.')

    config = defaults(config, {
      couch_httpd_auth: {
        authentication_db: '_users'
      }
    })

    // attempt to setAuthHandlers
    setAuthHandlers(couch, function (error) {
      if (error) state.server.log(['database', 'warn'], 'Could not set CouchDB values to `/_config`, hoodie may not run correctly.')

      callback(null, config)
    })
  })
}

function getCurrentConfig (couch, callback) {
  couch({
    url: '/_config'
  }, function (error, response, data) {
    if (error || (response && response.statusCode !== 200)) {
      return callback(new Error('There was an error loading CouchDB values from `/_config`'))
    }

    callback(null, data)
  })
}

function setAuthHandlers (couch, callback) {
  couch({
    url: '/_config/httpd/authentication_handlers',
    method: 'PUT',
    body: '{couch_httpd_oauth, oauth_authentication_handler},{couch_httpd_auth, default_authentication_handler},{couch_httpd_auth, cookie_authentication_handler}'
  }, function (error, response, data) {
    if (error || (response && response.statusCode !== 200)) {
      return callback(new Error('Could not set necessary CouchDB config'))
    }

    callback(null)
  })
}
