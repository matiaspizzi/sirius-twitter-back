import { UserViewDTO } from '@domains/user/dto'
import { FollowerDTO } from '../dto'

export interface FollowerService {
  createFollow: (followerId: string, followedId: string) => Promise<FollowerDTO>
  deleteFollow: (followerId: string, followedId: string) => Promise<void>
  getFollowByIds: (followerId: string, followedId: string) => Promise<FollowerDTO>
  doesFollowExist: (followerId: string, followedId: string) => Promise<boolean>
  getFollowers: (userId: string) => Promise<FollowerDTO[]>
  getFollows: (userId: string) => Promise<FollowerDTO[]>
  getMutuals: (userId: string) => Promise<UserViewDTO[]>
}
