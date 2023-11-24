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

  async newMessage (userId: string, to: string, content: string): Promise<MessageDTO> {
    const doesFollow = await this.followerRepository.getByIds(userId, to)
    const doesFollowBack = await this.followerRepository.getByIds(to, userId)
    if (!doesFollow || !doesFollowBack) throw new NotFoundException('Follow')
    return await this.repository.create({ content, from: userId, to })
  }

  async getMessages (userId: string, to: string): Promise<MessageDTO[]> {
    const receiver = await this.userRepository.getById(to)
    if (!receiver) throw new NotFoundException('user')
    const messages = await this.repository.getByUserIds(userId, to)
    if (!messages.length) throw new NotFoundException('messages')
    return messages
  }
}
