import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
import 'express-async-errors'

import { db } from '@utils'

import { MessageRepositoryImpl } from '../repository'
import { MessageService, MessageServiceImpl } from '../service'
import { FollowerRepositoryImpl } from '@domains/follower/repository'
import { UserRepositoryImpl } from '@domains/user/repository'
export const messageRouter = Router()

// Use dependency injection
const service: MessageService = new MessageServiceImpl(new MessageRepositoryImpl(db), new FollowerRepositoryImpl(db), new UserRepositoryImpl(db))

messageRouter.get('/:receiverId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { receiverId } = req.params

  const messages = await service.getMessages(userId, receiverId)

  return res.status(HttpStatus.OK).json(messages)
})

messageRouter.post('/:receiverId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { receiverId } = req.params
  const { content } = req.body

  const message = await service.sendMessage(userId, receiverId, content)

  return res.status(HttpStatus.CREATED).json(message)
})
