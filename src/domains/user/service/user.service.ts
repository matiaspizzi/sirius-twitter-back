import { OffsetPagination } from '@types'
import { UserDTO } from '../dto'

export interface UserService {
  deleteUser: (userId: string) => Promise<void>
  getUser: (userId: string) => Promise<UserDTO>
  getUserRecommendations: (userId: any, options: OffsetPagination) => Promise<UserDTO[]>
  setPrivate: (userId: string, isPrivate: string) => Promise<void>
  setProfilePicture: (userId: string, profilePicture: any) => Promise<string | null>
  getProfilePicture: (userId: string) => Promise<string | null>
}
