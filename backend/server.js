let groups = {}

let server = require('http').createServer()
let io = require('socket.io')(server)

io.on('connection', socket => {
  let room = null
  console.log(`${socket.id} connected`)
  socket.on('join', ([url, user]) => {
    room = url
    socket.join(room)
    console.log(`${user} joined room ${room}`)
    groups[room] = groups[room] ? groups[room] : {}
    groups[room][socket.id] = user
    io.to(room).emit('list users', groups[room])
    console.log(groups[room])
  })
  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`)
    delete groups[room][socket.id]
    io.to(room).emit('list users', groups[room])
  })
})

server.listen(3000)
