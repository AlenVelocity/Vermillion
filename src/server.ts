import { config } from 'dotenv'
config()
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import SocketServer from './socketServer'
import { ExpressPeerServer } from 'peer'
import * as socket from 'socket.io'
import path from 'path'
import server from 'http'
import authRouter from './routes/authRouter'
import userRouter from './routes/userRouter'
import postRouter from './routes/postRouter'
import messageRouter from './routes/messageRouter'
import commentRouter from './routes/commentRouter'
import notifyRouter from './routes/notifyRouter'

const app = express()
app.use(express.json())
app.use(cors())
app.use(cookieParser())

// Socket
const http = server.createServer(app)
const io = new socket.Server(http)

io.on('connection', (socket) => {
    SocketServer(socket)
})

// Create peer server
ExpressPeerServer(http, { path: '/' })

// Routes
app.use('/api', authRouter)
app.use('/api', userRouter)
app.use('/api', postRouter)
app.use('/api', commentRouter)
app.use('/api', notifyRouter)
app.use('/api', messageRouter)

const URI = process.env.MONGO_URL as string
mongoose.connect(
    URI,
    {
        useCreateIndex: true,
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    (err) => {
        if (err) throw err
        console.log('Connected to Database')
    }
)

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'))
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'))
    })
}

const port = process.env.PORT || 5000
http.listen(port, () => {
    console.log('Server is running on port', port)
})
