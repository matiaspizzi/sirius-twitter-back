import { FollowerDTO } from '../dto'

export interface FollowerService {
  createFollow: (followerId: string, followedId: string) => Promise<FollowerDTO>
  deleteFollow: (followerId: string, followedId: string) => Promise<void>
  getFollowByIds: (followerId: string, followedId: string) => Promise<FollowerDTO>
}
