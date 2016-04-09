let groups = {}

let server = require('http').createServer()
let io = require('socket.io')(server)

const port = process.env.PORT || 3000

io.on('connection', socket => {
  let _room = null
  let socketId = socket.id.slice(2)

  socket.on('join', (url) => {
    if (!url) return
    _room = url
    socket.join(_room)
    groups[_room] = groups[_room] || {}
    console.log(`${socketId} connect to room ${_room}`)
  })

  socket.on('scroll', param => {
    param.id = socketId
    console.log('scroll', param)
    groups[_room][socketId] = param
    io.to(_room).emit('users', groups[_room])
  })

  socket.on('message', param => {
    param.id = socketId
    console.log('message', param)
    io.to(_room).emit('message', param)
  })

  socket.on('disconnect', () => {
    if (!groups[_room]) return
    if (groups[_room][socketId]) {
      delete groups[_room][socketId]
    }
    console.log(`${socketId} leaves room ${_room}, rest ${Object.keys(groups[_room]).length}`)
    io.to(_room).emit('users', groups[_room])
  })
})

server.listen(port)
console.log(`listening on port ${port}`)
