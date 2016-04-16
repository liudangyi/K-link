import SocketIO from 'socket.io-client'
let socket = SocketIO('http://localhost:3000')
let socketId = null
socket.on('connect', () => {
  socketId = socket.id
  console.log(socketId)
})

let activePorts = {}
let user = {}

chrome.storage.sync.get(['name', 'email'], function(ret) {
  ret.name || (ret.name = 'anon')
  ret.email || (ret.email = 'anon@anon.anon')
  user = ret
})

socket.on('locations', (msg) => {
  let users = []
  for (let sid in msg.users) {
    for (let pid in msg.users[sid]) {
      users.push({
        id: sid + pid,
        name: msg.users[sid][pid].user.name,
        email: msg.users[sid][pid].user.email,
        location: msg.users[sid][pid].location,
      })
    }
  }
  for (let pid in activePorts) {
    let port = activePorts[pid]
    if (port.room === msg.room) {
      port.postMessage({
        type: 'users',
        users: users,
      })
    }
  }
})

chrome.runtime.onConnect.addListener(function(port) {
  console.log(port)
  port.room = port.sender.tab.url
  port.sid = socketId
  port.pid = port.sender.tab.id
  port.postMessage({test: 'background'})
  activePorts[port.pid] = port
  port.onDisconnect.addListener(function() {
    delete activePorts[port.pid]
    socket.emit('leave', {
      sid: port.sid,
      pid: port.pid,
      room: port.room,
    })
  })
  port.onMessage.addListener(function(msg) {
    port.room = port.sender.tab.url
    if (msg.type === 'user') {
      port.postMessage({
        type: 'user',
        user: user,
        id: port.sid + port.pid,
      })
      socket.emit('users', port.room)
    } else if (msg.type === 'location') {
      console.log('location', msg.location, user.name)
      socket.emit('location', {
        location: msg.location,
        user: user,
        sid: port.sid,
        pid: port.pid,
        room: port.room,
      })
    }
  })
})
