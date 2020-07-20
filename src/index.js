const port = process.env.PORT || 3000
const path = require('path')
var express = require('express');
const app = express()
const http = require('http')
const socketio= require('socket.io')
const server = http.createServer(app)
const io = socketio(server)
const {generateMsg,generateLocationMsg} = require('./utils/messages')
const { addUser,removeUser,getUsersInRoom,getUser } = require('./utils/user')
const publicDirectoryPath = path.join(__dirname, "../public")
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {

   
    socket.on('join',({displayName,room},callback)=>{
      const {error,user} = addUser({ id: socket.id , displayName, room})

      if(error){
       return callback(error)
      }

      socket.join(user.room)
      socket.emit('msg',generateMsg('Welcome!'))
      socket.broadcast.to(user.room).emit('msg',generateMsg(`${user.displayName} has Joined!`));

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
    })
      callback()
    })


    socket.on('incMsg' ,(msg,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('msg',generateMsg(user.displayName,msg))
        callback()
    })


    socket.on('geoLocation',(position,callback)=>{
      const user = getUser(socket.id)
      io.to(user.room).emit('geoLocation',generateLocationMsg(user.displayName,`https://google.com/maps?q=${position.latitude},${position.longitude}`))
      callback()
    })


    socket.on('disconnect', () => {
     const user = removeUser(socket.id)
     if(user){
      io.to(user.room).emit('msg',generateMsg(`${user.displayName} has left!`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
    })
     }
    })
  })


server.listen(port, ()=>{
    console.log(`server is running on port ${port}`);
})