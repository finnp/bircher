const socketio = require('socket.io')
const Irc = require('irc-framework')
const express = require('express')
const envobj = require('envobj')
const http = require('http')

const app = express()
app.use('/', express.static('dist'))
const server = http.createServer(app)
const io = socketio(server)

const env = envobj({
  CHANNEL: '#bircher',
  PORT: 3000
})

const channelName = env.CHANNEL

io.on('connection', function (socket) {
  const irc = new Irc.Client()

  socket.on('disconnect', function () {
    irc.quit()
  })

  irc.command_handler.on('all', function (e, data) {
    console.log(e, data)
  })

  irc.on('nick in use', function (data) {
    socket.emit('irc-error', data.reason)
  })

  irc.on('nick invalid', function (data) {
    socket.emit('irc-error', 'Username invalid: ' + data.reason)
  })

  socket.on('error', function (err) {
    console.error(err)
  })

  socket.on('join', function (nick) {
    console.log(`${nick} connected`)
    irc.connect({
      host: 'irc.freenode.net',
      port: 6667,
      nick,
      username: nick,
      gecos: nick
    })
  })

  irc.on('registered', function () {
    socket.emit('connected', channelName)
    const channel = irc.channel(channelName)
    irc.on('topic', function (data) {
      socket.emit('topic', data.topic)
    })
    channel.updateUsers()
    channel.stream().on('data', function (message) {
      socket.emit('message', message)
    })
    socket.on('say', function (text) {
      channel.say(text)
    })

    irc.on('userlist', updateUsers)
    irc.on('join', updateUsers)
    irc.on('part', updateUsers)
    irc.on('kick', updateUsers)
    irc.on('quit', updateUsers)
    irc.on('nick', updateUsers)
    irc.on('mode', updateUsers)

    function updateUsers () {
      process.nextTick(function () {
        socket.emit('users', channel.users)
      })
    }
  })
})

server.listen(env.PORT)
