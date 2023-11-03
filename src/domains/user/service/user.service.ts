import { OffsetPagination, CursorPagination } from '@types'
import { UserDTO, UserViewDTO, ExtendedUserDTO } from '../dto'

export interface UserService {
  deleteUser: (userId: string) => Promise<void>
  getUser: (userId: string) => Promise<ExtendedUserDTO>
  getUsersByUsername: (username: string, options: CursorPagination) => Promise<UserViewDTO[]>
  getUserView: (userId: string) => Promise<UserViewDTO>
  getUserRecommendations: (userId: any, options: OffsetPagination) => Promise<UserViewDTO[]>
  setPrivate: (userId: string, isPrivate: string) => Promise<void>
  setProfilePicture: (userId: string) => Promise<string | null>
  getProfilePicture: (userId: string) => Promise<string | null>
}
