module.exports = configurePouchDb

function configurePouchDb (state, callback) {
  state.db.config = new state.PouchDB('hoodie-config').doc('hoodie')

  process.nextTick(function () {
    callback()
  })
}
