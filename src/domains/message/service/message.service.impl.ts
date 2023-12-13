import { NotFoundException } from '@utils/errors'
import { MessageDTO } from '../dto'
import { MessageRepository } from '../repository'
import { MessageService } from './message.service'
import { FollowerRepository } from '@domains/follower/repository'
import { UserRepository } from '@domains/user/repository'
import { UserViewDTO } from '@domains/user/dto'

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
  
  async getChats (userId: string): Promise<UserViewDTO[]> {
    const messages = await this.repository.getChats(userId)
    const users = await Promise.all(
      messages.map(async (message) => {
        const user = await this.userRepository.getById(message.from === userId ? message.to : message.from)
        if (user) return new UserViewDTO(user)
      })
    )
    return users.filter((user) => user) as UserViewDTO[]
  }

  async getChat (userId: string, to: string): Promise<MessageDTO[]> {
    const receiver = await this.userRepository.getById(to)
    if (!receiver) throw new NotFoundException('user')
    const messages = await this.repository.getChat(userId, to)
    return messages
  }
}
