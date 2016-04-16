let groups = {}

let server = require('http').createServer()
let io = require('socket.io')(server)
const port = process.env.PORT || 3000

let MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017/notes'

MongoClient.connect(url, function(err, db) {
  if (err) {
    console.log(err)
  }
  console.log('Connected correctly to database server.')
  io.on('connection', socket => {
    let socketId = socket.id.slice(2)
    console.log(socketId, 'connected.')
    socket.on('leave', ({id, room}) => {
      console.log(id, room)
      if (!room || !groups[room]) return
      delete groups[room][id]
      io.to(room).emit('locations', {
        room: room,
        users: groups[room],
      })
      console.log(`${socketId} disconnect to room ${room}, rest ${Object.keys(groups[room]).length}`)
    })

    socket.on('location', (data) => {
      console.log('location', data)
      let room = data.room
      groups[room] || (groups[room] = {})
      if (!groups[room][data.id]) {
        socket.join(room)
      }
      groups[room][data.id] = data
      io.to(room).emit('locations', {
        room: room,
        users: groups[room],
      })
    })

    socket.on('users', (room) => {
      io.to(room).emit('locations', {
        room: room,
        users: groups[room],
      })
    })
    socket.on('message', param => {
      param.id = socketId
      console.log('message', param)
      // io.to(_room).emit('message', param)
    })

    /*
      room: String, data: {}
    */
    socket.on('note', data => {
      if (!data) {
        return
      }
      console.log(`${socketId} is making note ${data}`)
      // data.room = _room
      db.collection('note').insertOne(data, function(err, r) {
        if (err) {
          console.log(err)
        }
        // io.to(_room).emit('note', data)
      })
    })

    socket.on('query', (criteria = {}) => {
      console.log(`${socketId} is querying data.`)
      // criteria.room = _room
      db.collection('note').find(criteria).toArray(function(err, docs) {
        if (err) {
          console.log(err)
          return
        }
        socket.emit('notes', docs)
      })
    })

    socket.on('disconnect', () => {
      // if (!groups[_room]) return
      // if (groups[_room][socketId]) {
      //   delete groups[_room][socketId]
      // }
      // console.log(`${socketId} leaves room ${_room}, rest ${Object.keys(groups[_room]).length}`)
      // io.to(_room).emit('users', groups[_room])
    })
  })
})

server.listen(port)
console.log(`listening on port ${port}`)
