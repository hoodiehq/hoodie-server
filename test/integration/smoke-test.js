var Hapi = require('hapi')
var request = require('request')
var test = require('tap').test

var hoodie = require('../../').register
var hapiOptions = {
  debug: {
    request: ['error'],
    log: ['error']
  }
}
var hapiPluginOptions = {
  register: hoodie,
  options: {
    inMemory: true,
    loglevel: 'error',
    db: {
      db: require('memdown')
    }
  }
}

require('npmlog').level = 'error'

test('smoke test', function (t) {
  var server = new Hapi.Server(hapiOptions)
  server.connection({port: 8090})

  server.register(hapiPluginOptions, function (error) {
    t.error(error, 'loads hoodie plugin without error')

    server.start(function (error) {
      t.error(error, 'hoodie starts without error')

      request({
        url: 'http://localhost:8090/hoodie/store/api/',
        json: true
      }, function (error, response, data) {
        t.error(error, 'no error on request')

        t.is(response.statusCode, 401, 'status 401')
        t.ok(data.error, 'Unauthorized')

        server.stop(t.end)
      })
    })
  })
})
