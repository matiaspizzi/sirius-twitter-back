import { OffsetPagination } from '@types'
import { UserDTO, UserViewDTO, ExtendedUserDTO } from '../dto'

export interface UserService {
  deleteUser: (userId: string) => Promise<void>
  getUser: (userId: string) => Promise<ExtendedUserDTO>
  getUsersByUsername: (username: string, options: OffsetPagination) => Promise<UserViewDTO[]>
  getUserView: (userId: string) => Promise<UserViewDTO>
  getUserRecommendations: (userId: any, options: OffsetPagination) => Promise<UserDTO[]>
  setPrivate: (userId: string, isPrivate: string) => Promise<void>
  setProfilePicture: (userId: string) => Promise<string | null>
  getProfilePicture: (userId: string) => Promise<string | null>
}
