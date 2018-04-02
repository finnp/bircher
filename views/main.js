var html = require('choo/html')
var Notifications = require('dom-notifications/main')

var notifications = new Notifications()

var TITLE = 'bircher'

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  // state.connected = true
  // state.messages = [
  //   {message: 'test', nick: 'hi'},
  //   {message: 'hallo', nick: 'ho'},
  //   {message: 'halloooo', nick: 'hol'},
  //   {message: 'halloooo', nick: 'finnp', ident: 'sid42883'},
  //   {message: 'halloooo', nick: 'no-avatar', ident: 'sid209493'}
  // ]

  return html`
    <body class="helvetica">
      ${notifications.render(state.notifications)}
      ${state.connected ? showMessages() : login()}
    </body>
  `

  function onkeyup (e) {
    if (e.key === 'Enter') emit('irc:say', e.target.value)
  }

  function showMessages () {
    return html`
      <div class="flex flex-column h-100">
        <div class="w-100 pa2 bg-lightest-blue">
          <strong>${state.channel}</strong>
          <span>${state.topic || ''}</span>
        </div>
        <div class="flex h-100">
          ${renderUserlist(state.users)}
          <div class="flex flex-column chat w-100">
            <div class="messages pl4 pt4 h-100">
              ${state.messages.map(renderMessage)}
              <div id="messagesbottom"></div>
            </div>
            <div>
              <input onkeyup=${onkeyup} class="input-reset ba b--black-20 pa2 ma3 db w-75" type="text">
            </div>
          </div>
        </div>
      </div>
    `
  }

  function login () {
    return html`
    <div class="vh-100 dt w-100 bg-blue">
    <div class="dtc v-mid pl3">
      <form class="pa5 bg-white w-50" method="get" accept-charset="utf-8" onsubmit=${onlogin}>
        <div class="f4">How do you want to be called?</div>
        <fieldset class="ba b--transparent ph0 mh0">
          <legend class="ph0 mh0 fw6 clip">Join chat</legend>
          <div class="mt3">
            <label class="db fw4 lh-copy f6" for="email-address">Nickname</label>
            <input maxlength="16" placeholder=${state.defaultNick} id="nickname" class="pa2 input-reset ba bg-transparent w-100 measure" type="text">
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
    emit('irc:join', name || state.defaultNick)
  }

  function renderUserlist () {
    return renderUserlistFromList(
      state.users.length > 0
        ? state.users.map(user => state.nick === user.nick ? user.nick + ' (you)' : user.nick)
        : ['██████', '████', '██████']
    )
  }

  function renderUserlistFromList (texts) {
    return html`<div class="userlist pl2 bg-navy h-100 white">
      <h3 class="mb2">Users</h3>
      ${texts.map(text => html`<div class="pb2">${text}</div>`)}
    </div>`
  }

  function renderMessage (message) {
    if (message.sameAuthor) {
      return html`
        <div class="pt1 flex">
          <div class="avatar mr2"></div>
          <div>${message.message}</div>
        </div>
      `
    }
    return html`
    <div class="pt2 flex">
      <div class="avatar mr2">${getAvatar(message)}</div>
      <div>
        <div class="pb1"><strong>${message.nick}</strong></div>
        <div>${message.message}</div>
      </div>
    </div>
    `
  }

  function getAvatar (message) {
    var avatar = state.avatars[message.nick]
    if (!avatar) return html`<div></div>`
    return html`<img src="${avatar}" alt="Avatar of ${message.nick}" />`
  }
}
