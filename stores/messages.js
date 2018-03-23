module.exports = store

function store (state, emitter) {
  state.messages = [
    {user: 'Finn', text: 'Hello there'},
    {user: 'Luna', text: 'Hiiii'},
    {user: 'Yosh', text: 'lol'}
  ]
  emitter.on('messages:send', (text) => {
    state.messages.push({user: 'Finn', text: text})
    emitter.emit('render')
  })
}
