var css = require('sheetify')
var choo = require('choo')
var ssejson = require('ssejson')

css('tachyons')

var app = choo()
if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-devtools')())
} else {
  app.use(require('choo-service-worker')())
}

app.use(require('./stores/messages'))

app.use(function (state, emitter) {
  emitter.on('login', function (nick) {
    state.nick = nick
    const sse = ssejson.fromEventSource(new window.EventSource('http://localhost:3000/events/' + nick))
    sse.on('data', function (data) {
      if (data.type === 'connected') {
        state.connected = true
        emitter.emit('render')
      } else {
        emitter.emit('messages:receive', data)
      }
    })
  })
})

app.route('/', require('./views/main'))
app.route('/*', require('./views/404'))

module.exports = app.mount('body')
