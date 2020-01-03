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
            id: socket.id
        }
   
        io.emit('NEW_MESSAGE', newMessage )
        callback();

        console.log(connectedUsers)
    })

    socket.on('disconnect', () => {
       
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

        socket.broadcast.to('General').emit('USER_DISCONNECTED', `${findUser.user} se ha desconectado.`)

        const newConnectedUsers = connectedUsers.filter((user) => user.id !== socket.id)
        
        connectedUsers = newConnectedUsers
        
        console.log(connectedUsers)

        io.emit('CONNECTED_USERS', connectedUsers)

    })
}

