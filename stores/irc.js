var remote = require('socket.io-client')('http://localhost:3000')
var animateScrollTo = require('animated-scroll-to')

module.exports = store

function store (state, emitter) {
  state.messages = []
  state.users = []
  state.channel = '...'

  emitter.on(state.events.DOMCONTENTLOADED, function () {
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
        setTimeout(function () {
          emitter.emit('irc:scrollbottom')
        }, 100)
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
      setTimeout(function () {
        emitter.emit('irc:scrollbottom')
      }, 100)
    })

    emitter.on('irc:scrollbottom', function () {
      var target = document.querySelector('#messagesbottom')
      var element = document.querySelector('.messages')
      animateScrollTo(target, {
        element
      })
    })
  })
}
