const Irc = require('irc-framework')
const io = require('socket.io')()

const channelName = '#lasch'

io.on('connection', function (client) {
  const irc = new Irc.Client()

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
    channel.join()
    channel.stream().on('data', function (message) {
      client.emit('message', message)
    })
    client.on('say', function (text) {
      channel.say(text)
    })
  })
})
io.listen(3000)
