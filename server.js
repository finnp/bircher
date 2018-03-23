const Irc = require('irc-framework')
const http = require('http')
const pump = require('pump')
const ssejson = require('ssejson')

const irc = new Irc.Client()

irc.connect({
  host: 'irc.freenode.net',
  port: 6667,
  nick: 'lasch-dev-test'
})

var mainChannel

irc.on('registered', () => {
  console.log('ready')
  const channel = irc.channel('#gitterircbot')
  channel.join()

  mainChannel = channel
})

http.createServer(function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'text/event-stream')
  if (mainChannel) {
    pump(
      mainChannel.stream(),
      ssejson.serialize({}),
      res
    )
  } else {
    res.end('Server not ready')
  }
}).listen(3000)
