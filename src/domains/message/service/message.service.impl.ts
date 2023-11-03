import { NotFoundException } from '@utils/errors'
import { MessageDTO } from '../dto'
import { MessageRepository } from '../repository'
import { MessageService } from './message.service'
import { FollowerRepositoryImpl } from '@domains/follower/repository'
import { FollowerServiceImpl } from '@domains/follower/service'
import { db } from '@utils'


const followerService = new FollowerServiceImpl(new FollowerRepositoryImpl(db))

export class MessageServiceImpl implements MessageService {
  constructor (private readonly repository: MessageRepository) {}

  async getMessages (userId: string, receiverId: string): Promise<MessageDTO[]> {
    const messages = await this.repository.getByUserIds(userId, receiverId)
    if (!messages) throw new NotFoundException('messages')
    return messages
  }

  async sendMessage (userId: string, receiverId: string, content: string): Promise<MessageDTO> {
    console.log(typeof(userId), userId, typeof(receiverId), receiverId)
    const doesFollow = await followerService.doesFollowExist(userId, receiverId)
    const doesFollowBack = await followerService.doesFollowExist(receiverId, userId)
    if (!doesFollow || !doesFollowBack) throw new NotFoundException('user')
    return await this.repository.create({ content, senderId: userId, receiverId })
  }
}
