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
    groups[_room] = groups[_room] && {}
  })

  socket.on('scroll', param => {
    groups[_room][socket.id] = param
    io.to(_room).emit('users', groups[_room])
  })

  socket.on('message', param => {
    io.to(_room).emit('message', param)
  })

  socket.on('disconnect', () => {
    console.log(_room)
    if (groups[_room][socket.id]) {
      delete groups[_room][socket.id]
    }
    io.to(_room).emit('users', groups[_room])
  })
})

server.listen(port)
console.log(`listening on port ${port}`)
