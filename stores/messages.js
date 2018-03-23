module.exports = store

function store (state, emitter) {
  state.messages = []

  emitter.on('messages:send', function (text) {
    state.messages.push({nick: 'Finn', message: text})
    emitter.emit('render')
  })

  emitter.on('messages:receive', function (message) {
    state.messages.push(message)
    emitter.emit('render')
  })
}
