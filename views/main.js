var html = require('choo/html')

var TITLE = 'lasch - main'

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  return html`
    <body class="sans-serif">
      ${state.connected ? showMessages() : login()}
    </body>
  `

  function onkeyup (e) {
    if (e.key === 'Enter') emit('irc:say', e.target.value)
  }

  function showMessages () {
    return html`
      <div>
        <div class="pl4 pt4">
          ${state.messages.map(renderMessage)}
        </div>
        <input onkeyup=${onkeyup} class="input-reset ba b--black-20 pa2 ma3 db w-100 bottom-0 fixed" type="text">
      </div>
    `
  }

  function login () {
    return html`
    <div class="vh-100 dt w-100">
    <div class="dtc v-mid tc ph3 ph4-l">
      <form method="get" accept-charset="utf-8" onsubmit=${onlogin}>
        <fieldset class="ba b--transparent ph0 mh0">
          <legend class="ph0 mh0 fw6 clip">Join chat</legend>
          <div class="mt3">
            <label class="db fw4 lh-copy f6" for="email-address">Nick name</label>
            <input id="nickname" class="pa2 input-reset ba bg-transparent w-100 measure" type="text">
          </div>
        </fieldset>
        <div class="mt3"><input class="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6" type="submit" value="${state.connecting ? 'Connecting...' : 'Start chatting'}"></div>
      </form>
    </div>
    </div>
    `
  }

  function onlogin (e) {
    e.preventDefault()
    var name = e.target.querySelector('#nickname').value
    emit('irc:join', name || defaultUsername())
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

function defaultUsername () {
  return 'laschuser' + Math.random().toString().slice(2, 10)
}
