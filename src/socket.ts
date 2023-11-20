import { Socket as IOSocket } from 'socket.io'
import { db, Constants, Logger } from '@utils'
import { MessageRepositoryImpl } from '@domains/message/repository'
import { MessageServiceImpl } from '@domains/message/service'
import jwt from 'jsonwebtoken'
import { io } from './server'
import { FollowerRepositoryImpl } from '@domains/follower/repository'
import { UserRepositoryImpl } from '@domains/user/repository'

interface Socket extends IOSocket {
  userId?: string
}

const messageService = new MessageServiceImpl(new MessageRepositoryImpl(db), new FollowerRepositoryImpl(db), new UserRepositoryImpl(db))

io.use((socket: Socket, next) => {
  const token = socket.handshake.query.token

  if (typeof token !== 'string') {
    next(new Error('INVALID_TOKEN'))
    socket.disconnect()
    return
  }

  jwt.verify(token, Constants.TOKEN_SECRET, (err, context) => {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (err || context === undefined || typeof context === 'string') {
      next(new Error('INVALID_TOKEN'))
      socket.disconnect()
    } else {
      socket.userId = context.userId
      next()
    }
  })
})

io.on('connection', (socket: Socket) => {
  if (!socket.userId) return socket.disconnect()
  Logger.info(`user connected ${socket.userId}`)

  socket.on('getMessages', async (receiverId) => {
    if (!socket.userId) return
    const messages = await messageService.getMessages(socket.userId, receiverId)
    socket.emit('messages', messages)
  })

  socket.on('sendMessage', async (data) => {
    if (!socket.userId) return
    console.log(data)
    const parsedData = JSON.parse(data)
    console.log(parsedData.receiverId)
    const message = await messageService.sendMessage(socket.userId, parsedData.receiverId, parsedData.content)
    io.emit('newMessage', message)
  })
})

// front: getMessages, back: envia messages para el front con messages
// front: sendMessage, back: envia message para el front con newMessage
