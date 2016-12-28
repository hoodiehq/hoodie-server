module.exports = getSecret

var internals = getSecret.internals = {}
internals.randomstring = require('randomstring')

function getSecret (state, callback) {
  state.db.config.get()

  .then(function (config) {
    if (config.secret) {
      state.secret = config.secret
      return callback()
    }

    config.secret = internals.randomstring.generate({
      charset: 'hex'
    })

    state.db.config.set(config)

    .then(function () {
      state.secret = config.secret
      callback()
    })
  })

  .catch(callback)
}
