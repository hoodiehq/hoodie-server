var proxyquire = require('proxyquire').noCallThru()
var simple = require('simple-mock')
var test = require('tap').test

var preAuthHook = proxyquire('../../../lib/config/store/pre-auth-hook', {
  'boom': {
    unauthorized: simple.stub().returnWith(new Error('unauthorized'))
  }
})

test('store pre auth hook', function (t) {
  var session = {
    session: {
      id: 'session123'
    },
    account: {
      id: 'user123'
    }
  }
  var findSessionStub = simple.stub().returnWith({ // don’group use resolveWith to avoid async
    then: function (callback) {
      callback(session)
      return {
        catch: function () {}
      }
    }
  })
  var serverStub = {
    plugins: {
      account: {
        api: {
          sessions: {
            find: findSessionStub
          }
        }
      }
    }
  }
  var request = {
    path: 'user123',
    headers: {
      authorization: 'Session session123'
    },
    connection: {
      server: serverStub
    }
  }
  var reply = {
    continue: simple.stub()
  }

  preAuthHook(request, reply)

  t.is(reply.continue.callCount, 1, 'reply.continue() called')

  t.end()
})

test('store pre auth hook root path', function (t) {
  var session = {
    session: {
      id: 'session123'
    },
    account: {
      id: 'user123'
    }
  }
  var findSessionStub = simple.stub().returnWith({ // don’group use resolveWith to avoid async
    then: function (callback) {
      callback(session)
      return {
        catch: function () {}
      }
    }
  })
  var serverStub = {
    plugins: {
      account: {
        api: {
          sessions: {
            find: findSessionStub
          }
        }
      }
    }
  }
  var request = {
    path: '/hoodie/store/api/',
    method: 'get',
    headers: {
      authorization: 'Session session123'
    },
    connection: {
      server: serverStub
    }
  }
  var reply = {
    continue: simple.stub()
  }

  preAuthHook(request, reply)

  t.is(reply.continue.callCount, 1, 'reply.continue() called')

  t.end()
})

test('store pre auth hook unauthorized error', function (t) {
  var session = {
    session: {
      id: 'session123'
    },
    account: {
      id: 'user123'
    }
  }
  var findSessionStub = simple.stub().resolveWith(session)
  var serverStub = {
    plugins: {
      account: {
        api: {
          sessions: {
            find: findSessionStub
          }
        }
      }
    }
  }
  var request = {
    path: 'user456',
    headers: {
      authorization: 'Session session123'
    },
    connection: {
      server: serverStub
    }
  }

  t.plan(2)
  preAuthHook(request, function (error) {
    t.ok(error)
    t.is(error.message, 'unauthorized', 'throws unauthorized error')
  })
})
