const app = require('http').createServer()
const io = module.exports.io = require('socket.io')(app)
const log = console.log

const PORT = process.env.PORT || 5000
const SocketManager = require('./SocketManager')

io.on('connection', SocketManager)

app.listen(process.env.PORT || 5000, () => {
    log(`connected to PORT ${PORT}`)
})