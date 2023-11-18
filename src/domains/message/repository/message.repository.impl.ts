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

  async getById (messageId: string): Promise<MessageDTO | null> {
    const message = await this.db.message.findUnique({
      where: {
        id: messageId
      }
    })
    return message ? new MessageDTO(message) : null
  }

  async getByUserIds (userId: string, receiverId: string): Promise<MessageDTO[]> {
    const messages = await this.db.message.findMany({
      where: {
        AND: [
          {
            senderId: userId
          },
          {
            receiverId
          }
        ]
      }
    })
    return messages.map((message) => new MessageDTO(message))
  }
}
