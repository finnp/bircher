var html = require('choo/html')

var TITLE = 'lasch - main'

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  return html`
    <body class="sans-serif">
    <div class="pl4 pt4">
      ${state.messages.map(renderMessage)}
    </div>
    <input onkeyup=${onkeyup} class="input-reset ba b--black-20 pa2 ma3 db w-100 bottom-0 fixed" type="text">
    </body>
  `

  function onkeyup (e) {
    if (e.key === 'Enter') emit('messages:send', e.target.value)
  }
}

function renderMessage (message) {
  return html`
  <div class="pb2">
    <div><strong>${message.nick}</strong></div>
    <div>${message.message}</div>
  </div>
  `
}
