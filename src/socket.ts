import { Socket as IOSocket } from 'socket.io'
import { Logger } from '@utils'
import { db } from '@utils'
import { MessageRepositoryImpl } from '@domains/message/repository'
import { MessageServiceImpl } from '@domains/message/service'
import { Constants } from '@utils'
import jwt from 'jsonwebtoken'
import { io } from './server'

interface Socket extends IOSocket {
  userId?: string;
}

const messageService = new MessageServiceImpl(new MessageRepositoryImpl(db))

io.use((socket: Socket, next) => {
  const token = socket.handshake.query.token;

  if (typeof token !== 'string') {
    next(new Error('INVALID_TOKEN'))
    socket.disconnect();
    return;
  }

  jwt.verify(token, Constants.TOKEN_SECRET, (err, context) => {
    if (err || !context || typeof context === 'string') {
      next(new Error('INVALID_TOKEN'));
      socket.disconnect();
    } else {
      socket.userId = context.userId;
      next();
    }
  });
});

io.on('connection', (socket: Socket) => {
  if(!socket.userId) return socket.disconnect()
  Logger.info(`user connected ${socket.userId}`)
  
  socket.on('getMessages', async (receiverId) => {
    if (!socket.userId) return;
    const messages = await messageService.getMessages(socket.userId, receiverId)
    socket.emit("messages", messages)
  })

  socket.on("sendMessage", async (data) => {
    if (!socket.userId) return;
    console.log(data)
    const parsedData = JSON.parse(data)
    console.log(parsedData.receiverId)
    // console.log(`user ${socket.userId} sent message to ${receiverId}`)
    // const message = await messageService.sendMessage(socket.userId, receiverId, content)
    // io.emit("newMessage", message)
  })
})