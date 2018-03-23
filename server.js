const Irc = require('irc-framework')
const http = require('http')
const pump = require('pump')
const pumpify = require('pumpify')
const ssejson = require('ssejson')
const serverRouter = require('server-router')

const channelName = '#gitterircbot'

const irc = new Irc.Client()
const router = serverRouter()

router.route('GET', '/events/:nick', function (req, res, params) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'text/event-stream')
  const respond = pumpify.obj(ssejson.serialize({}), res)
  const nick = params.nick
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
})

router.route('', '*', function (req, res) {
  res.statusCode = 404
  res.end('Nothing to see here')
})

http.createServer(router.start()).listen(3000)
