const remote = require('socket.io-client')('http://localhost:3000')

module.exports = store

function store (state, emitter) {
  state.messages = []
  state.users = []

  emitter.on('irc:join', function (nick) {
    state.nick = nick
    state.connecting = true
    emitter.emit('render')
    remote.emit('join', nick)
    remote.on('connected', function (channel) {
      state.connecting = false
      state.connected = true
      state.channel = channel
      emitter.emit('render')
    })
    remote.on('message', function (message) {
      state.messages.push(message)
      emitter.emit('render')
    })
    remote.on('users', function (users) {
      state.users = users
      emitter.emit('render')
    })
    remote.on('topic', function (topic) {
      state.topic = '  ' + topic
      emitter.emit('render')
    })
  })

  emitter.on('irc:say', function (text) {
    var message = {nick: state.nick, message: text}
    if (text.trim()[0] === '/') {
      window.alert('IRC commands are not supported. Sorry!')
      return
    }
    state.messages.push(message)
    remote.emit('say', text)
    emitter.emit('render')
  })
}
