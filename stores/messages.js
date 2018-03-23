const ssejson = require('ssejson')

const messageEvents = ssejson.fromEventSource(new window.EventSource('http://localhost:3000/'))

module.exports = store

function store (state, emitter) {
  state.messages = []

  emitter.on('messages:send', (text) => {
    state.messages.push({nick: 'Finn', message: text})
    emitter.emit('render')
  })

  messageEvents.on('data', function (message) {
    state.messages.push(message)
    emitter.emit('render')
  })
}
