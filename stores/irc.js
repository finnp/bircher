var remote = require('socket.io-client')(process.env.SERVER)
var animateScrollTo = require('animated-scroll-to')
var keyBy = require('lodash/keyby')

module.exports = store

function store (state, emitter) {
  state.messages = []
  state.users = {} // key: nick
  state.channel = '...'
  state.defaultNick = 'user' + Math.random().toString().slice(2, 10)

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
        checkAvatar(message)
        setTimeout(function () {
          emitter.emit('irc:scrollbottom')
        }, 100)
      })
      remote.on('users', function (users) {
        state.users = keyBy(users, 'nick')
        emitter.emit('render')
      })
      remote.on('topic', function (topic) {
        state.topic = '  ' + topic
        emitter.emit('render')
      })
      remote.on('irc-error', function (errorMessage) {
        state.connecting = false
        emitter.emit('error', errorMessage)
      })
    })

    emitter.on('irc:say', function (text) {
      var message = {
        nick: state.nick,
        message: text
      }
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

  function checkAvatar (message) {
    var user = state.users[message.nick]
    if (user && !user.checkedAvatar) {
      findIrcCloudAvatar(message)
        .then(ircCloudAvatar => {
          user.avatar = ircCloudAvatar
          user.checkedAvatar = true
          emitter.emit('render')
        })
    }
  }

  function findIrcCloudAvatar (message) {
    return new Promise(resolve => {
      if (!message.ident || message.ident.slice(0, 3) !== 'sid') return resolve(false)

      var url = `https://static.irccloud-cdn.com/avatar-redirect/s36/${message.ident.slice(3)}`
      var testImage = new window.Image()
      testImage.onload = () => resolve(url)
      testImage.onerror = () => resolve(false)
      testImage.src = url
    })
  }
}
