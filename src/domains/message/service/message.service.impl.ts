import { NotFoundException } from '@utils/errors'
import { MessageDTO } from '../dto'
import { MessageRepository } from '../repository'
import { MessageService } from './message.service'
import { FollowerRepository } from '@domains/follower/repository'
import { UserRepository } from '@domains/user/repository'

export class MessageServiceImpl implements MessageService {
  constructor (
    private readonly repository: MessageRepository,
    private readonly followerRepository: FollowerRepository,
    private readonly userRepository: UserRepository
  ) {}

  async sendMessage (userId: string, receiverId: string, content: string): Promise<MessageDTO> {
    const doesFollow = await this.followerRepository.getByIds(userId, receiverId)
    const doesFollowBack = await this.followerRepository.getByIds(receiverId, userId)
    if (!doesFollow || !doesFollowBack) throw new NotFoundException('user')
    return await this.repository.create({ content, senderId: userId, receiverId })
  }

  async getMessages (userId: string, receiverId: string): Promise<MessageDTO[]> {
    const receiver = await this.userRepository.getById(receiverId)
    if (!receiver) throw new NotFoundException('user')
    const messages = await this.repository.getByUserIds(userId, receiverId)
    if (!messages.length) throw new NotFoundException('messages')
    return messages
  }
}
