import { PrismaClient } from '@prisma/client'
import { MessageDTO, MessageInputDTO } from '../dto'
import { MessageRepository } from './message.repository'

export class MessageRepositoryImpl implements MessageRepository {
  constructor (private readonly db: PrismaClient) {}

  async create (data: MessageInputDTO): Promise<MessageDTO> {
    return await this.db.message
      .create({
        data
      })
      .then((message) => new MessageDTO(message))
  }

  async getChats (userId: string): Promise<MessageDTO[]> {
    const messages = await this.db.message.findMany({
      where: {
        OR: [
          {
            from: userId
          },
          {
            to: userId
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      distinct: ['from', 'to']
    })
    return messages.map((message) => new MessageDTO(message))
  }

  async getChat (userId: string, to: string): Promise<MessageDTO[]> {
    const messages = await this.db.message.findMany({
      where: {
        OR: [
          {
            AND: [
              {
                from: userId
              },
              {
                to
              }
            ]
          },
          {
            AND: [
              {
                from: to
              },
              {
                to: userId
              }
            ]
          }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    return messages.map((message) => new MessageDTO(message))
  }
}
