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
  user = ret
})

socket.on('locations', (msg) => {
  console.log('locations', msg)
  let users = []
  for (let id in msg.users) {
    console.log(msg.users)
    users.push({
      id: id,
      name: msg.users[id].user.name,
      email: msg.users[id].user.email,
      location: msg.users[id].location,
    })
  }
  for (let id in activePorts) {
    let port = activePorts[id]
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
  port.id = socketId + port.sender.tab.id
  port.postMessage({test: 'background'})
  activePorts[port.id] = port
  console.log(port.room, 'connected')
  port.onDisconnect.addListener(function() {
    console.log(port.room, 'disconnect')
    socket.emit('leave', {
      id: port.id,
      room: port.room,
    })
    delete activePorts[port.id]
  })
  port.onMessage.addListener(function(msg) {
    port.room = port.sender.tab.url
    if (msg.type === 'user') {
      port.postMessage({
        type: 'user',
        user: user,
        id: port.id,
      })
    } else if (msg.type === 'users') {
      socket.emit('users', port.room)
    } else if (msg.type === 'location') {
      console.log('location', msg.location, user.name)
      socket.emit('location', {
        location: msg.location,
        user: user,
        id: port.id,
        room: port.room,
      })
    }
  })
})
