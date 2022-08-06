require('dotenv').config()
const express = require('express')
const { urlencoded, json, static } = require('express')
const formatMessage = require('./utils/messages.js')
const {userJoin, getCurrentUser, getRoomUsers, userLeave } = require('./utils/users.js')
const path = require('path')
const http = require('http')
const { Server } = require('socket.io')

const BOT_NAME = 'nangosha-bot '

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(urlencoded())
app.use(json())
app.use(static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.send("hello, mother fuckers.......")
})

io.on('connection', (socket) => {
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room)
        socket.join(user.room)

        socket.emit('message', formatMessage(BOT_NAME, 'welcome to ChatCord.'))
        socket.broadcast.to(user.room).emit('message', formatMessage(BOT_NAME, `${user.userName} has joined the chat`))

        // send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    // listen for chat message
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.userName, msg))
    })

    // run when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        if(user){
            io.to(user.room).emit('message', formatMessage(BOT_NAME, `${user.userName} has left the chat.`))
            // send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })
})

server.listen(process.env.SERVER_PORT, () => {
    console.log(`server listening to connections on port ${process.env.SERVER_PORT}`)
})

