module.exports = migrateToStoreDb

/* istanbul ignore next */
function migrateToStoreDb (state, couch, callback) {
  state.server.log(['store', 'sill', 'deprecation'], 'Checking if migration required for server.plugins.store.api usage (hoodiehq/hoodie-server#507)')
  couch({url: '/hoodie-store'}, function (error, response, data) {
    if (error) {
      return callback(error)
    }

    if (response.statusCode === 200) {
      state.server.log(['store', 'sill', 'deprecation'], 'No migration required for server.plugins.store.api usage')
      return callback()
    }

    couch({url: '/_all_dbs'}, function (error, response, data) {
      if (error) {
        return callback(error)
      }

      if (response.statusCode !== 200) {
        return callback(new Error('Could not load /_all_dbs'))
      }

      var dbDocs = data.filter(isUserDb).map(toDbDoc)

      if (dbDocs.length === 0) {
        state.server.log(['store', 'sill', 'deprecation'], 'No migration required for server.plugins.store.api usage')
        callback()
      }

      state.server.log(['store', 'warn', 'deprecation'], 'Migrating databases for server.plugins.store.api usage (hoodiehq/hoodie-server#507)')
      couch({
        url: '/hoodie-store',
        method: 'PUT'
      }, function (error, response, data) {
        if (error) {
          return callback(error)
        }

        if (response.statusCode !== 201) {
          return callback(new Error('Could not create /hoodie-store'))
        }

        couch({
          url: '/hoodie-store/_security',
          method: 'PUT',
          body: {
            members: {
              roles: ['_hoodie_admin_only']
            }
          }
        }, function (error, response, data) {
          if (error) {
            return callback(error)
          }

          if (response.statusCode !== 200) {
            return callback(new Error('Could not create /hoodie-store/_security'))
          }

          couch({
            url: '/hoodie-store/_bulk_docs',
            method: 'POST',
            body: {docs: dbDocs}
          }, function (error, response, data) {
            if (error) {
              return callback(error)
            }

            console.log(`\nresponse.statusCode ==============================`)
            console.log(response.statusCode)

            if (response.statusCode !== 201) {
              return callback(new Error('Could not POST /hoodie-store/_bulk_docs: ' + JSON.stringify(data)))
            }

            state.server.log(['store', 'info', 'deprecation'], 'Databases migrated for server.plugins.store.api usage')
            callback()
          })
        })
      })
    })
  })
}

/* istanbul ignore next */
function isUserDb (dbName) {
  return dbName.slice(0, 5) === 'user/'
}

/* istanbul ignore next */
function toDbDoc (dbName) {
  var accountId = dbName.slice(5)
  var docId = 'db_' + dbName
  var access = {
    read: {
      role: ['id:' + accountId]
    },
    write: {
      role: ['id:' + accountId]
    }
  }
  return {
    _id: docId,
    access: access
  }
}
