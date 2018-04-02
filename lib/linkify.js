var linkify = require('linkify-it')()
var html = require('choo/html')

// TODO: Turn this into a Nanocomponent

module.exports = function (text) {
  if (!text) return ''
  var matches = linkify.match(text)
  var lastIndex = 0
  var parts = []
  matches.forEach(function (match) {
    var part = text.substring(lastIndex, match.index)
    parts.push(part)
    parts.push(html`<a href="${match.url}" target="_blank">${match.text}</a>`)
    lastIndex = match.lastIndex
  })
  parts.push(text.slice(lastIndex))
  return parts
}
