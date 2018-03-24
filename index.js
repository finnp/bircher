var css = require('sheetify')
var choo = require('choo')

css('tachyons')
css('dom-notifications')
css('./custom.css')

var app = choo()
app.use(require('choo-devtools')())

app.use(require('./stores/errors'))
app.use(require('./stores/irc'))

app.route('/', require('./views/main'))
app.route('/*', require('./views/404'))

module.exports = app.mount('body')
