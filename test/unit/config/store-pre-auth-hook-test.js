var proxyquire = require('proxyquire').noCallThru()
var simple = require('simple-mock')
var test = require('tap').test

var preAuthHook = proxyquire('../../../lib/config/store/pre-auth-hook', {
  'boom': {
    unauthorized: simple.stub().returnWith(new Error('unauthorized')),
    wrap: simple.stub().callFn(function (error, status) {
      error.status = status
      return error
    })
  }
})

test('store pre auth hook', function (t) {
  var session = {
    session: {
      id: 'session123'
    },
    account: {
      id: 'user123',
      roles: []
    }
  }
  var findSessionStub = simple.stub().returnWith({ // don’t use resolveWith to avoid async
    then: function (callback) {
      callback(session)
      return {
        catch: function () {}
      }
    }
  })
  var hasAccessStub = simple.stub().returnWith({ // don’t use resolveWith to avoid async
    then: function (callback) {
      callback(true)
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
      },
      store: {
        api: {
          hasAccess: hasAccessStub
        }
      }
    }
  }
  var request = {
    path: '/hoodie/store/api/user%2F123',
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
      id: 'user123',
      roles: []
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

test('store pre auth hook session not found error', function (t) {
  var findSessionStub = simple.stub().rejectWith({status: 404})
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
    path: '/hoodie/store/api/user%2F456',
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

test('store pre auth hook unauthorized error', function (t) {
  var session = {
    session: {
      id: 'session123'
    },
    account: {
      id: 'user123',
      roles: []
    }
  }
  var findSessionStub = simple.stub().resolveWith(session)
  var hasAccessStub = simple.stub().resolveWith(false)
  var serverStub = {
    plugins: {
      account: {
        api: {
          sessions: {
            find: findSessionStub
          }
        }
      },
      store: {
        api: {
          hasAccess: hasAccessStub
        }
      }
    }
  }
  var request = {
    path: '/hoodie/store/api/user%2F456',
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

test('store pre auth hook server error', function (t) {
  var session = {
    session: {
      id: 'session123'
    },
    account: {
      id: 'user123',
      roles: []
    }
  }
  var findSessionStub = simple.stub().resolveWith(session)
  var hasAccessStub = simple.stub().rejectWith(new Error('ooops'))
  var serverStub = {
    log: simple.stub(),
    plugins: {
      account: {
        api: {
          sessions: {
            find: findSessionStub
          }
        }
      },
      store: {
        api: {
          hasAccess: hasAccessStub
        }
      }
    }
  }
  var request = {
    path: '/hoodie/store/api/user%2F456',
    headers: {
      authorization: 'Session session123'
    },
    connection: {
      server: serverStub
    }
  }

  t.plan(3)
  preAuthHook(request, function (error) {
    t.ok(error)
    t.is(error.status, 500, 'throws 500 error')
    t.is(error.message, 'ooops', 'oooopsie')
  })
})
