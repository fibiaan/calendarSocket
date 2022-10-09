const app = require('express')()
const cors = require('cors')
app.use(cors({
    origin: '*'
}))
const { createServer } = require("http");
const bodyParser = require("body-parser")
const { Server } = require("socket.io");
const {router} = require("./routes/api")
const port = 3001

const jsonParser = bodyParser.json()
app.use(jsonParser)

httpServer = createServer(app);
io = new Server(httpServer, {
    cors: '*'
})

router(app, io);

app.get('/', (req, res) => {
    console.log('node version', req.body)
    io.to('calendar').emit("test", {fibiaan: 'mejia'})
    res.json({
        fibiaan: 'mejia'
    })
})

io.on('connection', (socket) => {

    console.log('connected', socket.id)

    socket.on('joinCalendar', () => {
        console.log('joining to Calendar')
        socket.join('calendar')
    })

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id)
        socket.broadcast.emit('userDisconnected', socket.id)
    })
})

httpServer.listen(port)
