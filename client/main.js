Meteor.startup(function () {
  Meteor.connection._stream.eventCallbacks.message.push(function (msg) {
    console.log('websocket event', msg)
  })
})

Meteor.startup(async function () {
  // 客户的 sessionId 最好从后端拿过来, 前段的 _lastSessionId 是个 refrence 值，可能要客户端 ready 后才能知道
  const sessionId = await getSessionId()

  const $add = document.getElementById('add')
  const $currentSessionId = document.getElementById('current-session-id')
  const $logContainer = document.getElementById('log-container')

  $add.onclick = () => Meteor.call('addTest', sessionId, Meteor.isClient)
  $currentSessionId.innerText = sessionId

  Tracker.autorun(function () {
    const sub = Meteor.subscribe('test', sessionId)
    if (!sub.ready()) return

    const $list = document.createElement('div')

    Test.find().forEach(function (doc) {
      const $item = document.createElement('div')
      $item.innerText = `${doc.sessionId} ${doc.text}`
      $list.appendChild($item)
    })

    try { $logContainer.removeChild($logContainer[0]) } catch {}

    $logContainer.appendChild($list)
  })
})

async function getSessionId () {
  return new Promise(function (onDone) {
    Meteor.call('getSessionId', function (err, sessionId) {
      onDone(sessionId)
    })
  })
}
