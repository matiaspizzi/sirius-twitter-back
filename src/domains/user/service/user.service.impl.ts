import { NotFoundException } from '@utils/errors'
import { OffsetPagination } from 'types'
import { UserDTO } from '../dto'
import { UserRepository } from '../repository'
import { UserService } from './user.service'

export class UserServiceImpl implements UserService {
  constructor (private readonly repository: UserRepository) {}

  async getUser (userId: any): Promise<UserDTO> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')
    return user
  }

  async getUserRecommendations (userId: any, options: OffsetPagination): Promise<UserDTO[]> {
    // TODO: make this return only users followed by users the original user follows
    return await this.repository.getRecommendedUsersPaginated(options)
  }

  async deleteUser (userId: any): Promise<void> {
    await this.repository.delete(userId);
  }

  async setPrivate (userId: any, isPrivate: string): Promise<void> {
    if (isPrivate !== 'true' && isPrivate !== 'false') throw new Error('The parameter must be true or false')
    let set: boolean
    isPrivate === 'true' ? set = true : set = false
    await this.repository.setPrivate(userId, set)
  }

  async setAvatar (userId: any, avatar: any): Promise<void> {
    if(avatar === undefined) throw new Error('No avatar provided')

    await this.repository.setAvatar(userId, avatar)
  }
}
