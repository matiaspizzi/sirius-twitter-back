import { FollowerDTO } from '../dto'

export interface FollowerRepository {
  create: (followerId: string, followedId: string) => Promise<FollowerDTO>
  delete: (followId: string) => Promise<void>
  getByIds: (followerId: string, followedId: string) => Promise<FollowerDTO | null>
  getFollowers: (userId: string) => Promise<FollowerDTO[]>
  getFollows: (userId: string) => Promise<FollowerDTO[]>
}
