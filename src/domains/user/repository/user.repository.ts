import { SignupInputDTO } from '@domains/auth/dto'
import { OffsetPagination } from '@types'
import { ExtendedUserDTO, UserDTO } from '../dto'

export interface UserRepository {
  create: (data: SignupInputDTO) => Promise<UserDTO>
  delete: (userId: string) => Promise<void>
  getRecommendedUsersPaginated: (options: OffsetPagination) => Promise<UserDTO[]>
  getById: (userId: string) => Promise<ExtendedUserDTO | null>
  getByEmailOrUsername: (email?: string, username?: string) => Promise<ExtendedUserDTO | null>
  setPrivate: (userId: string, isPrivate: boolean) => Promise<void>
  setProfilePicture: (userId: string, pictureUrl: string) => Promise<void>
  getProfilePicture: (userId: string) => Promise<string | null>
}
