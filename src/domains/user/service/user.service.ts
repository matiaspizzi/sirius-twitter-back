import { OffsetPagination } from '@types'
import { UserViewDTO, ExtendedUserDTO } from '../dto'

export interface UserService {
  deleteUser: (userId: string) => Promise<void>
  getUser: (userId: string) => Promise<ExtendedUserDTO>
  getUsersByUsername: (username: string, options: OffsetPagination) => Promise<UserViewDTO[]>
  getUserView: (userId: string) => Promise<UserViewDTO>
  getUserRecommendations: (userId: any, options: OffsetPagination) => Promise<UserViewDTO[]>
  setPrivate: (userId: string, isPrivate: string) => Promise<boolean>
  setProfilePicture: (userId: string) => Promise<{ presignedUrl: string, profilePictureUrl: string }>
  getProfilePicture: (userId: string) => Promise<string | null>
}
