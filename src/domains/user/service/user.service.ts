import { OffsetPagination } from '@types'
import { UserDTO } from '../dto'

export interface UserService {
  deleteUser: (userId: string) => Promise<void>
  getUser: (userId: string) => Promise<UserDTO>
  getUserRecommendations: (userId: any, options: OffsetPagination) => Promise<UserDTO[]>
  setPrivate: (userId: string, isPrivate: string) => Promise<void>
  setAvatar: (userId: string, avatar: any) => Promise<string | undefined>
}
