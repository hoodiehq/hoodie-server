# hoodie-server

> Hapi plugin for Hoodie’s server core module

[![Build Status](https://travis-ci.org/hoodiehq/hoodie-server.svg?branch=master)](https://travis-ci.org/hoodiehq/hoodie-server)
[![Coverage Status](https://coveralls.io/repos/hoodiehq/hoodie-server/badge.svg?branch=master)](https://coveralls.io/r/hoodiehq/hoodie-server?branch=master)
[![Dependency Status](https://david-dm.org/hoodiehq/hoodie-server.svg)](https://david-dm.org/hoodiehq/hoodie-server)
[![devDependency Status](https://david-dm.org/hoodiehq/hoodie-server/dev-status.svg)](https://david-dm.org/hoodiehq/hoodie-server#info=devDependencies)

`@hoodie/server` integrates Hoodie’s server core modules:

- [account-server](https://github.com/hoodiehq/hoodie-account-server)
- [store-server](https://github.com/hoodiehq/hoodie-store-server)

## Example

```js
var Hapi = require('hapi')
var hoodie = require('@hoodie/server').register
var PouchDB = require('pouchdb-core').plugin(require('pouchdb-mapreduce')).plugin(require('pouchdb-adapter-memory'))

var server = new Hapi.Server()
server.connection({
  host: 'localhost',
  port: 8000
})

server.register({
  register: hoodie,
  options: { // pass options here
    PouchDB: PouchDB,
    paths: {
      public: 'dist'
    }
  }
}, function (error) {
  if (error) {
    throw error
  }

  server.start(function (error) {
    if (error) {
      throw error
    }

    console.log(('Server running at:', server.info.uri)
  })
})
```

## Usage

option                    | default      | description
------------------------- | ------------ | -------------
**paths.data**            | `'.hoodie'`  | Data path
**paths.public**          | `'public'`   | Public path
**PouchDB**               | –            | [PouchDB constructor](https://pouchdb.com/api.html#defaults). See also [custom PouchDB builds](https://pouchdb.com/2016/06/06/introducing-pouchdb-custom-builds.html).
**account**               | `{}`         | [Hoodie Account Server](https://github.com/hoodiehq/hoodie-account-server/tree/master/plugin#options) options. `account.admins`, `account.secret` and `account.usersDb` are set based on `db` option above.
**store**                 | `{}`         | [Hoodie Store Server](https://github.com/hoodiehq/hoodie-store-server#options) options. `store.couchdb`, `store.PouchDB` are set based on the `PouchDB` option above. `store.hooks.onPreAuth` is set to bind user authentication for Hoodie Account to Hoodie Store.

## Testing

Local setup

```
git clone https://github.com/hoodiehq/hoodie-server.git
cd hoodie-server
npm install
```

Run all tests

```
npm test
```

## Contributing

Have a look at the Hoodie project's [contribution guidelines](https://github.com/hoodiehq/hoodie/blob/master/CONTRIBUTING.md).
If you want to hang out you can join our [Hoodie Community Chat](http://hood.ie/chat/).

## License

[Apache 2.0](LICENSE)
