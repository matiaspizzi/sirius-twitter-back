import { NotFoundException } from '@utils/errors'
import { OffsetPagination } from 'types'
import { UserDTO } from '../dto'
import { UserRepository } from '../repository'
import { UserService } from './user.service'
import { uploadS3Image } from '@utils/s3'

export class UserServiceImpl implements UserService {
  constructor (private readonly repository: UserRepository) {}

  async getUser (userId: string): Promise<UserDTO> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')
    return user
  }

  async getUserRecommendations (userId: string, options: OffsetPagination): Promise<UserDTO[]> {
    // TODO: make this return only users followed by users the original user follows
    return await this.repository.getRecommendedUsersPaginated(options)
  }

  async deleteUser (userId: string): Promise<void> {
    await this.repository.delete(userId)
  }

  async setPrivate (userId: string, isPrivate: string): Promise<void> {
    if (isPrivate !== 'true' && isPrivate !== 'false') throw new Error('The parameter must be true or false')
    let set: boolean
    isPrivate === 'true' ? set = true : set = false
    await this.repository.setPrivate(userId, set)
  }

  async setAvatar (userId: string, avatar: any): Promise<string | undefined> {
    if (avatar === undefined) throw new Error('No avatar provided')
    if (avatar.mimetype !== 'image/jpeg' && avatar.mimetype !== 'image/png') throw new Error('Avatar must be a jpeg or png')
    const profilePicture = await uploadS3Image(avatar)
    if (profilePicture) {
      await this.repository.setAvatar(userId, profilePicture)
      return profilePicture
    } else {
      throw new Error('Error uploading image')
    }
  }
}
