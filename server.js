const Irc = require('irc-framework')
const io = require('socket.io')()

const channelName = '#lasch'

io.on('connection', function (socket) {
  const irc = new Irc.Client()

  socket.on('disconnect', function () {
    irc.quit()
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
io.listen(3000)
