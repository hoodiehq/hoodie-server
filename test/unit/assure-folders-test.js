var proxyquire = require('proxyquire').noCallThru()
var simple = require('simple-mock')
var test = require('tap').test

test('assure config folders', function (group) {
  group.test('without config.db.prefix', function (t) {
    var mkdirpMock = simple.stub().callbackWith(null)
    var assureFolders = proxyquire('../../lib/config/assure-folders', {
      mkdirp: mkdirpMock
    })

    assureFolders({
      config: {
        paths: {
          data: 'data path'
        }
      },
      db: {
        options: {}
      }
    }, function (error) {
      t.error(error)

      t.is(mkdirpMock.callCount, 1, 'mkdirp called once')
      t.is(mkdirpMock.lastCall.arg, 'data path', 'data path created')

      t.end()
    })
  })

  group.test('with config.db.prefix', function (t) {
    var mkdirpMock = simple.stub().callbackWith(null)
    var assureFolders = proxyquire('../../lib/config/assure-folders', {
      mkdirp: mkdirpMock
    })

    assureFolders({
      config: {
        paths: {
          data: 'data path'
        }
      },
      db: {
        options: {
          prefix: 'db prefix'
        }
      }
    }, function (error) {
      t.error(error)

      t.is(mkdirpMock.callCount, 2, 'mkdirp called twice')
      t.is(mkdirpMock.lastCall.arg, 'db prefix', 'db prefix path created')

      t.end()
    })
  })

  group.test('with config.db.prefix that is an url', function (t) {
    var mkdirpMock = simple.stub().callbackWith(null)
    var assureFolders = proxyquire('../../lib/config/assure-folders', {
      mkdirp: mkdirpMock
    })

    assureFolders({
      config: {
        paths: {
          data: 'data path'
        }
      },
      db: {
        options: {
          prefix: 'http://admin:admin@localhost:5984'
        }
      }
    }, function (error) {
      t.error(error)

      t.is(mkdirpMock.callCount, 1, 'mkdirp called once')
      t.is(mkdirpMock.lastCall.arg, 'data path', 'db prefix path created')

      t.end()
    })
  })

  group.end()
})
