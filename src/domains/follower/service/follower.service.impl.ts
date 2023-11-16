import { FollowerDTO } from '../dto'
import { FollowerRepository } from '../repository'
import { FollowerService } from '.'
import { NotFoundException, ForbiddenException } from '@utils'

export class FollowerServiceImpl implements FollowerService {
  constructor (private readonly repository: FollowerRepository) {}

  async createFollow (followerId: string, followedId: string): Promise<FollowerDTO> {
    if (followerId === followedId) throw new ForbiddenException()
    if (await this.doesFollowExist(followerId, followedId)) throw new ForbiddenException()
    return await this.repository.create(followerId, followedId)
  }

  async deleteFollow (followerId: string, followedId: string): Promise<void> {
    const follow = await this.repository.getByIds(followerId, followedId)
    if (!follow) throw new NotFoundException('follow')
    await this.repository.delete(follow.id)
  }

  async getFollowByIds (followerId: string, followedId: string): Promise<FollowerDTO> {
    const follow = await this.repository.getByIds(followerId, followedId)
    if (!follow) throw new NotFoundException('follow')
    return follow
  }

  async doesFollowExist (followerId: string, followedId: string): Promise<boolean> {
    const follow = await this.repository.getByIds(followerId, followedId)
    return (follow != null)
  }
}
