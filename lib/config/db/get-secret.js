module.exports = getConfig

var randomstring = require('randomstring')

// load server secret from the config database. If it’s not yet set, then
// generate a uuid and set it. Resolves with server secret
function getConfig (state, callback) {
  state.db.config.get()

  .then(function (config) {
    if (config.secret) {
      return callback(null, config.secret)
    }

    config.secret = randomstring.generate({
      charset: 'hex'
    })
    return state.db.config.set(config)

    .then(function () {
      callback(null, config.secret)
    })
  })

  .catch(callback)
}
