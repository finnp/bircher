const Irc = require('irc-framework')
const io = require('socket.io')()

const channelName = '#lasch'

io.on('connection', function (client) {
  const irc = new Irc.Client()

  client.on('disconnect', function () {
    irc.quit()
  })

  client.on('join', function (nick) {
    console.log(`${nick} connected`)
    irc.connect({
      host: 'irc.freenode.net',
      port: 6667,
      nick
    })
  })

  irc.on('registered', function () {
    client.emit('connected')
    const channel = irc.channel(channelName)
    channel.updateUsers()
    channel.stream().on('data', function (message) {
      client.emit('message', message)
    })
    client.on('say', function (text) {
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
        client.emit('users', channel.users)
      })
    }
  })
})
io.listen(3000)
