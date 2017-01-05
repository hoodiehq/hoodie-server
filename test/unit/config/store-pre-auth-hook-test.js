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
  var findSessionStub = simple.stub().resolveWith(session)
  var hasAccessStub = simple.stub().resolveWith(true).resolveWith(false)

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
    path: '/hoodie/store/api/user%2F123',
    headers: {
      authorization: 'Session session123'
    },
    connection: {
      server: serverStub
    }
  }
  var reply = simple.stub()
  reply.continue = simple.stub()

  var output = preAuthHook(request, reply)

  t.type(output, Promise, 'returns a Promise')

  return output.then(function () {
    t.is(findSessionStub.callCount, 0, 'findSession should not be called')
    t.is(hasAccessStub.callCount, 1, 'hasAccess should be called once only')
    t.is(reply.continue.callCount, 1, 'reply.continue() called')
    t.is(reply.callCount, 0, 'reply() should not be called')
    t.end()
  })
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
    log: simple.stub(),
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
  var reply = simple.stub()
  reply.continue = simple.stub()

  var output = preAuthHook(request, reply)

  t.type(output, Promise, 'returns a Promise')

  return output.then(function () {
    t.is(reply.continue.callCount, 1, 'reply.continue() called')
    t.is(reply.callCount, 0, 'reply() should not be called')
    t.end()
  })
})

test('store pre auth hook no authorization header', function (t) {
  var findSessionStub = simple.stub()
  var hasAccessStub = simple.stub().resolveWith(false)
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
    headers: {},
    connection: {
      server: serverStub
    }
  }
  var reply = simple.stub()
  reply.continue = simple.stub()

  t.plan(6)
  return preAuthHook(request, reply)
    .then(function () {
      t.is(findSessionStub.callCount, 0, 'findSession() should not be called')
      t.is(hasAccessStub.callCount, 1, 'hasAccess() should be called once only')
      t.is(reply.continue.callCount, 0, 'reply.continue() should not be called')
      t.is(reply.callCount, 1, 'reply() called once only')
      t.ok(reply.calls[0].args[0])
      t.is(reply.calls[0].args[0].message, 'unauthorized', 'throws unauthorized error')
    })
})

test('store pre auth hook session not found error', function (t) {
  var findSessionStub = simple.stub().rejectWith({status: 404})
  var hasAccessStub = simple.stub().resolveWith(false)
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
  var reply = simple.stub()
  reply.continue = simple.stub()

  t.plan(4)
  preAuthHook(request, reply)
    .then(function () {
      t.is(reply.continue.callCount, 0, 'reply.continue() should not be called')
      t.is(reply.callCount, 1, 'reply() called once only')
      t.ok(reply.calls[0].args[0])
      t.is(reply.calls[0].args[0].message, 'unauthorized', 'throws unauthorized error')
    })
})

test('store pre auth hook not public access & session found', function (t) {
  var findSessionStub = simple.stub().resolveWith({
    id: 'session123',
    account: {
      id: 'account123',
      roles: []
    }
  })
  var hasAccessStub = simple.stub().callFn(function (name, options) {
    if (options.role) {
      return Promise.resolve(true) // accessiable to signed in user
    }

    return Promise.resolve(false) // not public access
  })
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

  t.plan(1)
  return preAuthHook(request, {
    continue: function () {
      t.pass('all good')
    }
  })
})

test('store pre auth hook read-only byy users for POST db/_all_docs', function (t) {
  var findSessionStub = simple.stub().resolveWith({
    id: 'session123',
    account: {
      id: 'account123',
      roles: []
    }
  })
  var hasAccessStub = simple.stub().callFn(function (name, options) {
    if (options.role) {
      return Promise.resolve(true) // accessiable to signed in user
    }

    return Promise.resolve(false) // not public access
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
    method: 'post',
    path: '/hoodie/store/api/user%2F456/_all_docs',
    headers: {
      authorization: 'Session session123'
    },
    connection: {
      server: serverStub
    }
  }

  t.plan(1)
  return preAuthHook(request, {
    continue: function () {
      t.pass('all good')
    }
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
  return preAuthHook(request, function (error) {
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
  return preAuthHook(request, function (error) {
    t.ok(error)
    t.is(error.status, 500, 'throws 500 error')
    t.is(error.message, 'ooops', 'oooopsie')
  })
})
