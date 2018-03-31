var remote = require('socket.io-client')(process.env.SERVER)
var animateScrollTo = require('animated-scroll-to')
var md5 = require('md5')

module.exports = store

function store (state, emitter) {
  state.messages = []
  state.users = []
  state.avatars = {}
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
        state.users = users
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
      checkAvatar(message)
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
    var avatar = state.avatars[message.nick]
    if (!avatar) {
      findAvatar(message)
        .then(avatar => {
          state.avatars[message.nick] = avatar
          emitter.emit('render')
        })
    }
  }

  function findAvatar (message) {
    var gravatarUrl = `https://www.gravatar.com/avatar/${md5(message.nick + '@bircher')}.jpg?s=36&d=identicon&f=y`

    return new Promise(resolve => {
      if (!message.ident || message.ident.slice(0, 3) !== 'sid') return resolve(gravatarUrl)

      var ircCloudUrl = `https://static.irccloud-cdn.com/avatar-redirect/s36/${message.ident.slice(3)}`
      var testImage = new window.Image()
      testImage.onload = () => resolve(ircCloudUrl)
      testImage.onerror = () => resolve(gravatarUrl)
      testImage.src = ircCloudUrl
    })
  }
}
