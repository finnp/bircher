const Irc = require('irc-framework')
const http = require('http')
const pump = require('pump')
const pumpify = require('pumpify')
const ssejson = require('ssejson')

const channelName = '#gitterircbot'

const irc = new Irc.Client()

http.createServer(function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'text/event-stream')
  const respond = pumpify.obj(ssejson.serialize({}), res)
  const nick = req.url.slice(1)
  console.log(`${nick} connected`)

  irc.connect({
    host: 'irc.freenode.net',
    port: 6667,
    nick
  })

  irc.on('registered', () => {
    respond.write({type: 'connected', nick})
    const channel = irc.channel(channelName)
    channel.join()
    pump(
      channel.stream(),
      respond
    )
  })
}).listen(3000)
