const io = require('./index').io

const { isUser } = require('./Helpers')

let connectedUsers = []

module.exports = function(socket) {

    console.log(socket.id)

    socket.on('VERIFY_USER', (name, callback) => {
   
        if(isUser(connectedUsers, name)) {
            callback({ isUser: true })
        } else {
            callback({isUser: null })
        }
    })

    socket.on('join', (newUser) => {
        
        connectedUsers = [...connectedUsers, newUser ]

        socket.join('General')
 
         socket.emit('WELCOME', `Bienvenido/a ${newUser.user}.`)
         io.emit('CONNECTED_USERS', connectedUsers)

         socket.broadcast.to('General').emit('NEW_USER', `${newUser.user} se ha conectado` )
        
    })

    socket.on('SEND_MESSAGE', ( { userConnected, message } , callback) => {

        const newMessage = {
            user: userConnected,
            message,
            id: socket.id,
            createdAt: new Date()
        }
   
        io.emit('NEW_MESSAGE', newMessage )
        callback()

    })

    socket.on('SEND_PRIVATE_MESSAGE', ( { user, message, id }, callback) => {

        console.log(message)

        const findUser =  connectedUsers.find(USE => USE.id === socket.id)

        const newMessage = {
            sender: findUser.user,
            receiver: user,
            message,
            createdAt: new Date(),
            id: socket.id,
            readed: false
        }

        io.to(id).emit('NEW_PRIVATE_MESSAGE', newMessage )
        io.to(socket.id).emit('NEW_PRIVATE_MESSAGE', newMessage )
        
        callback()
    })

    socket.on('disconnect', () => {

        console.log('dissconect')
       
        const findUser =  connectedUsers.find(user => user.id === socket.id)

        if(findUser) {

        socket.broadcast.to('General').emit('USER_DISCONNECTED', `${findUser.user} se ha desconectado.`)

        const newConnectedUsers = connectedUsers.filter((user) => user.id !== socket.id)
        
        connectedUsers = newConnectedUsers

        console.log('disconnect')

        console.log(connectedUsers)

        io.emit('CONNECTED_USERS', connectedUsers)
        }
    })

    socket.on('USER_LEAVE', () => {

        const findUser =  connectedUsers.find(user => user.id === socket.id)

        if(findUser) {
        socket.broadcast.to('General').emit('USER_DISCONNECTED', `${findUser.user} se ha desconectado.`)

        const newConnectedUsers = connectedUsers.filter((user) => user.id !== socket.id)
        
        connectedUsers = newConnectedUsers
        
        console.log('USER_LEAVE')

        io.emit('CONNECTED_USERS', connectedUsers)

        }
    })
}

