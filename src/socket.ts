import { Socket as IOSocket, Server } from 'socket.io'
import { db, Constants, Logger } from '@utils'
import { MessageRepositoryImpl } from '@domains/message/repository'
import { MessageServiceImpl } from '@domains/message/service'
import jwt from 'jsonwebtoken'
import { FollowerRepositoryImpl } from '@domains/follower/repository'
import { UserRepositoryImpl } from '@domains/user/repository'
import { server } from './server'

interface Socket extends IOSocket {
  userId?: string
}

const messageService = new MessageServiceImpl(new MessageRepositoryImpl(db), new FollowerRepositoryImpl(db), new UserRepositoryImpl(db))
export const io = new Server(server, {
  cors: {
    origin: Constants.CORS_WHITELIST,
    methods: ['GET', 'POST']
  }
})

io.use((socket: Socket, next) => {
  const token = socket.handshake.query.token

  if (typeof token !== 'string') {
    next(new Error('INVALID_TOKEN'))
    socket.disconnect()
    return
  }

  jwt.verify(token, Constants.TOKEN_SECRET, (err, context) => {
    if (err != null || context === undefined || typeof context === 'string') {
      next(new Error('INVALID_TOKEN'))
      socket.disconnect()
    } else {
      socket.userId = context.userId
      next()
    }
  })
})

io.on('connection', async (socket: Socket) => {
  if (!socket.userId) return socket.disconnect()
  Logger.info(`user connected ${socket.userId}`)

  socket.on('message', async (data) => {
    if (!socket.userId) return
    console.log(data)
    try {
      const message = await messageService.newMessage(socket.userId, data.to, data.content)
      io.emit('message', message)
    } catch (err) {
      Logger.error(err)
    }
  })
})

// front: getMessages, back: envia messages para el front con messages
// front: sendMessage, back: envia message para el front con newMessage
