import { NotFoundException } from '@utils/errors'
import { OffsetPagination } from 'types'
import { UserDTO, UserViewDTO, ExtendedUserDTO } from '../dto'
import { UserRepository } from '../repository'
import { UserService } from './user.service'
import { generateS3UploadUrl } from '@utils/s3'
import { Constants } from '@utils'

export class UserServiceImpl implements UserService {
  constructor (private readonly repository: UserRepository) {}

  async getUser (userId: string): Promise<ExtendedUserDTO> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')
    return user
  }

  async getUserView (userId: string): Promise<UserViewDTO> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')
    const userView = new UserViewDTO(user)
    return userView
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

  async setProfilePicture (userId: string): Promise<string | null> {
    const data = await generateS3UploadUrl()
    const url = `https://${Constants.BUCKET_NAME}.s3.amazonaws.com/${data.filename}.jpeg`
    await this.repository.setProfilePicture(userId, url)
    return data.presignedUrl
  }

  async getProfilePicture (userId: string): Promise<string | null> {
    const url = await this.repository.getProfilePicture(userId)
    return url
  }
}
