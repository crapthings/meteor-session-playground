Meteor.publish('test', function (sessionId) {
  return Test.find({ sessionId, isClient: false }, { sort: { createdAt: -1 } })
})

Meteor.methods({
  addTest (sessionId, isClient, extra = {}) {
    return Test.insert({ sessionId, isClient, createdAt: new Date(), ...extra })
  },

  getSessionId () {
    return this.connection.id;
  }
})

Test.find({ isClient: true }).observe({
  added ({ sessionId }) {
    Meteor.call('addTest', sessionId, Meteor.isClient, { msg: `只有 ${sessionId} 可以看到` })
    console.log('有新数据时', Test.find().count())
  }
})

// 客户端退出相应的 session 文档也应该被删掉
Meteor.onConnection(function (connection) {
  connection.onClose(function () {
    const sessionId = connection.id
    Test.remove({ sessionId })
    console.log('session 退出后清空相应内存数据', Test.find().count())
  })
})

Meteor.setInterval(function () {
  Meteor.server.sessions.forEach(function (session) {
    // session.socket.send(Random.id(), JSON.stringify({ test: 1 }))
    session.socket.send(JSON.stringify({ msg: 'added', id: Random.id(), fields: { text: '这段消息在 console.log看' } }))
    session.socket.send(JSON.stringify({ msg: 'added', id: Random.id(), collection: 'test', fields: { text: '这段消息来自服务器' } }))
  })
}, 1000)
