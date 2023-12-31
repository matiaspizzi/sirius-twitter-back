import { PrismaClient } from '@prisma/client'

import { FollowerRepository } from '.'
import { FollowerDTO } from '../dto'

export class FollowerRepositoryImpl implements FollowerRepository {
  constructor (private readonly db: PrismaClient) {}

  async create (followerId: string, followedId: string): Promise<FollowerDTO> {
    const follow = await this.db.follow.create({
      data: {
        followerId,
        followedId
      }
    })
    return new FollowerDTO(follow)
  }

  async delete (followId: string): Promise<void> {
    await this.db.follow.delete({
      where: {
        id: followId
      }
    })
  }

  async getByIds (followerId: string, followedId: string): Promise<FollowerDTO | null> {
    const follow = await this.db.follow.findFirst({
      where: {
        followerId,
        followedId
      }
    })
    return follow != null ? new FollowerDTO(follow) : null
  }

  async getFollowers (userId: string): Promise<FollowerDTO[]> {
    const followers = await this.db.follow.findMany({
      where: {
        followedId: userId
      }
    })
    return followers.map((follower) => new FollowerDTO(follower))
  }

  async getFollows (userId: string): Promise<FollowerDTO[]> {
    const follows = await this.db.follow.findMany({
      where: {
        followerId: userId
      }
    })
    return follows.map((follow) => new FollowerDTO(follow))
  }
}
