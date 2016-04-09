let groups = {}

let server = require('http').createServer()
let io = require('socket.io')(server)

const port = process.env.PORT || 3000

io.on('connection', socket => {
  let _room = null

  socket.on('join', (url) => {
    _room = url
    console.log(`${socket.id} connect to room ${_room}`)
    socket.join(_room)
  })

  socket.on('scroll', ({location, username, email}) => {
    groups[_room] = groups[_room] ? groups[_room] : {}
    if (!groups[_room][socket.id]) {
      groups[_room][socket.id] = {
        location: location,
        username: username,
        email: email,
      }
    }
    io.to(_room).emit('users', groups[_room])
  })

  socket.on('message', ({message, username, email}) => {
    io.to(_room).emit('message', {
      username: username,
      email: email,
      message: message,
    })
    console.log(`${username} sent '${message}' to room ${_room}`)
  })

  socket.on('disconnect', () => {
    if (groups[_room][socket.id]) {
      delete groups[_room][socket.id]
    }
    io.to(_room).emit('users', groups[_room])
  })
})

server.listen(port)
console.log(`listening on port ${port}`)
