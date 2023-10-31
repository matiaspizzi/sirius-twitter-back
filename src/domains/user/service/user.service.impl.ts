import { NotFoundException } from '@utils/errors'
import { OffsetPagination } from 'types'
import { UserDTO } from '../dto'
import { UserRepository } from '../repository'
import { UserService } from './user.service'
import { generateS3UploadUrl } from '@utils/s3'

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

  async setProfilePicture (userId: string, filename: string): Promise<string | null> {
    const preSignedUrl = await generateS3UploadUrl(userId, filename)
    console.log(preSignedUrl)
    // await this.repository.setProfilePicture(userId, preSignedUrl)
    return preSignedUrl
  }
}
