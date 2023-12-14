import { FollowerDTO } from '../dto'
import { FollowerRepository } from '../repository'
import { FollowerService } from '.'
import { NotFoundException, ForbiddenException } from '@utils'
import { UserRepository } from '@domains/user/repository'
import { UserViewDTO } from '@domains/user/dto'

export class FollowerServiceImpl implements FollowerService {
  constructor (private readonly repository: FollowerRepository, private readonly userRepository: UserRepository) {}

  async createFollow (followerId: string, followedId: string): Promise<FollowerDTO> {
    if (followerId === followedId) throw new ForbiddenException()
    if (await this.repository.getByIds(followerId, followedId)) throw new ForbiddenException()
    const follower = await this.userRepository.getById(followerId)
    const followed = await this.userRepository.getById(followedId)
    if (!followed || !follower) throw new NotFoundException('user')
    return await this.repository.create(followerId, followedId)
  }

  async deleteFollow (followerId: string, followedId: string): Promise<void> {
    const follow = await this.repository.getByIds(followerId, followedId)
    if (!follow) throw new NotFoundException('follow')
    await this.repository.delete(follow.id)
  }

  async doesFollowExist (followerId: string, followedId: string): Promise<boolean> {
    const follow = await this.repository.getByIds(followerId, followedId)
    return follow != null
  }

  async getFollowers (userId: string): Promise<FollowerDTO[]> {
    const user = await this.userRepository.getById(userId)
    if (!user) throw new NotFoundException('user')
    return await this.repository.getFollowers(userId)
  }

  async getFollows (userId: string): Promise<FollowerDTO[]> {
    const user = await this.userRepository.getById(userId)
    if (!user) throw new NotFoundException('user')
    return await this.repository.getFollows(userId)
  }

  async getMutuals (userId: string): Promise<UserViewDTO[]> {
    const followers = await this.repository.getFollowers(userId)
    const follows = await this.repository.getFollows(userId)
    const mutuals = followers.filter((follower) => follows.find((follow) => follow.followedId === follower.followerId))
    const users = await Promise.all(
      mutuals.map(async (mutual) => {
        const user = await this.userRepository.getById(mutual.followerId)
        if (user) return new UserViewDTO(user)
      })
    )
    return users.filter((user) => user) as UserViewDTO[]
  }
}
