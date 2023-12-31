import { NotFoundException, ValidationException } from '@utils/errors'
import { OffsetPagination, CursorPagination } from 'types'
import { UserViewDTO, ExtendedUserDTO } from '../dto'
import { UserRepository } from '../repository'
import { UserService } from './user.service'
import { generateS3UploadUrl } from '@utils/s3'
import { Constants } from '@utils'
import { FollowerRepository } from '@domains/follower/repository'

export class UserServiceImpl implements UserService {
  constructor (private readonly repository: UserRepository, private readonly followerRepository: FollowerRepository) {}

  async getUser (userId: string): Promise<ExtendedUserDTO> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')
    return user
  }

  async getUsersByUsername (username: string, options: CursorPagination): Promise<UserViewDTO[]> {
    const users = await this.repository.getByUsernamePaginated(username, options)
    return users.map((user) => new UserViewDTO(user))
  }

  async getUserView (userId: string, loggedUser: string): Promise<{ user: UserViewDTO, followsYou: boolean, following: boolean }> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')
    const followsYou = await this.followerRepository.getByIds(userId, loggedUser)
    const following = await this.followerRepository.getByIds(loggedUser, userId)
    const userView = new UserViewDTO(user)
    return { user: userView, followsYou: followsYou != null, following: following != null }
  }

  async getSelfUserView (userId: string): Promise<UserViewDTO> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')
    const userView = new UserViewDTO(user)
    return userView
  }

  async getUserRecommendations (userId: string, options: OffsetPagination): Promise<UserViewDTO[]> {
    const recommendedUsers = await this.repository.getRecommendedUsersPaginated(userId, options)
    const filterPromises = recommendedUsers.map(async (user) => {
      const following = await this.followerRepository.getByIds(userId, user.id)
      return following ? false : true
    });
    const filterResults = await Promise.all(filterPromises);
    const filteredUsers = recommendedUsers.filter((_, index) => filterResults[index]);
    return filteredUsers.map((user) => new UserViewDTO(user));
  }

  async deleteUser (userId: string): Promise<void> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')
    await this.repository.delete(userId)
  }

  async setPrivate (userId: string, isPrivate: string): Promise<boolean> {
    if (isPrivate !== 'true' && isPrivate !== 'false') throw new ValidationException([{ message: 'The parameter must be true or false' }])
    let set: boolean
    isPrivate === 'true' ? (set = true) : (set = false)
    return await this.repository.setPrivate(userId, set)
  }

  async setProfilePicture (userId: string, filetype: string): Promise<{ presignedUrl: string, profilePictureUrl: string }> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')
    const data = await generateS3UploadUrl(filetype)
    const url = `https://${Constants.BUCKET_NAME}.s3.amazonaws.com/${data.filename}.jpeg`
    await this.repository.setProfilePicture(userId, url)
    return { presignedUrl: data.presignedUrl, profilePictureUrl: url }
  }

  async getProfilePicture (userId: string): Promise<string | null> {
    const url = await this.repository.getProfilePicture(userId)
    return url
  }
}
