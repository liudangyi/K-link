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
    socket.on('leave', ({sid, pid, room}) => {
      console.log(sid, pid, 'leave', room)
      if (!room || !groups[room] || !groups[room][sid]) return
      delete groups[room][sid][pid]
      io.to(room).emit('locations', {
        room: room,
        users: groups[room],
      })
    })
    socket.on('location', (data) => {
      console.log('location', data)
      let room = data.room
      groups[room] || (groups[room] = {})
      if (!groups[room][data.sid]) {
        socket.join(room)
        groups[room][data.sid] = {}
      }
      groups[room][data.sid][data.pid] = data
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
      console.log(socketId, 'disconnected.')
      for (let room in groups) {
        console.log(room, groups[room])
        delete groups[room][socketId]
      }
    })
  })
})

server.listen(port)
console.log(`listening on port ${port}`)
