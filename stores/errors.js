var loadExternal = require('load-external')

module.exports = store

function store (state, emitter) {
  state.notifications = []
  emitter.on(state.events.DOMCONTENTLOADED, function () {
    loadExternal('https://cdnjs.cloudflare.com/ajax/libs/octicons/3.5.0/octicons.min.css', 'css')

    emitter.on('error', function (error) {
      state.notifications.push({message: error, type: 'warning'})
      emitter.emit('render')
    })
  })
}
