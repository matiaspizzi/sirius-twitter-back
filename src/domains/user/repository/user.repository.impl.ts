import { SignupInputDTO } from '@domains/auth/dto'
import { PrismaClient } from '@prisma/client'
import { OffsetPagination } from '@types'
import { ExtendedUserDTO, UserDTO, UserViewDTO } from '../dto'
import { UserRepository } from './user.repository'
export class UserRepositoryImpl implements UserRepository {
  constructor (private readonly db: PrismaClient) {}

  async create (data: SignupInputDTO): Promise<UserDTO> {
    return await this.db.user
      .create({
        data
      })
      .then((user) => new UserDTO(user))
  }

  async getById (userId: string): Promise<ExtendedUserDTO | null> {
    const user = await this.db.user.findUnique({
      where: {
        id: userId
      }
    })
    return user ? new ExtendedUserDTO(user) : null
  }

  async delete (userId: string): Promise<void> {
    await this.db.user.delete({
      where: {
        id: userId
      }
    })
  }

  async getByUsernamePaginated (username: string, options: OffsetPagination): Promise<ExtendedUserDTO[]> {
    const users = await this.db.user.findMany({
      where: {
        username: {
          contains: username
        }
      },
      take: options.limit ? options.limit : undefined,
      skip: options.skip ? options.skip : undefined,
      orderBy: [
        {
          username: 'asc'
        }
      ]
    })
    return users.map((user) => new ExtendedUserDTO(user))
  }

  async getRecommendedUsersPaginated (userId: string, options: OffsetPagination): Promise<UserViewDTO[]> {
    // Obtén la lista de usuarios que el usuario actual sigue
    const following = await this.db.user.findMany({
      where: {
        followers: {
          some: {
            followerId: userId
          }
        }
      }
    })

    // Para cada usuario en esa lista, obtén la lista de usuarios que ellos siguen
    let recommendedUserIds: string[] = []
    for (const user of following) {
      const theirFollowing = await this.db.user.findMany({
        where: {
          followers: {
            some: {
              followerId: user.id
            }
          }
        }
      })

      recommendedUserIds = [...recommendedUserIds, ...theirFollowing.map((user) => user.id)]
    }

    // Elimina duplicados y el usuario actual de la lista de usuarios recomendados
    recommendedUserIds = [...new Set(recommendedUserIds)]
    recommendedUserIds = recommendedUserIds.filter((id) => id !== userId)

    // Pagina los resultados
    const users = await this.db.user.findMany({
      where: {
        id: {
          in: recommendedUserIds
        },
        isPrivate: false
      },
      take: options.limit ? options.limit : undefined,
      skip: options.skip ? options.skip : undefined,
      orderBy: {
        id: 'asc'
      }
    })

    console.log(users)

    return users.map((user) => new UserViewDTO(user))
  }

  async getByEmailOrUsername (email?: string, username?: string): Promise<ExtendedUserDTO | null> {
    const user = await this.db.user.findFirst({
      where: {
        OR: [
          {
            email
          },
          {
            username
          }
        ]
      }
    })
    return user ? new ExtendedUserDTO(user) : null
  }

  async getByEmail (email: string): Promise<ExtendedUserDTO | null> {
    const user = await this.db.user.findFirst({
      where: {
        email
      }
    })
    return user ? new ExtendedUserDTO(user) : null
  }

  async getByUsername (username: string): Promise<ExtendedUserDTO | null> {
    const user = await this.db.user.findFirst({
      where: {
        username
      }
    })
    return user ? new ExtendedUserDTO(user) : null
  }

  async setPrivate (userId: string, isPrivate: boolean): Promise<boolean> {
    const user = await this.db.user.update({
      where: {
        id: userId
      },
      data: {
        isPrivate
      }
    })

    return user.isPrivate
  }

  async setProfilePicture (userId: string, profilePicture: string): Promise<void> {
    await this.db.user.update({
      where: {
        id: userId
      },
      data: {
        profilePicture
      }
    })
  }

  async getProfilePicture (userId: string): Promise<string | null> {
    const user = await this.db.user.findUnique({
      where: {
        id: userId
      }
    })
    return user?.profilePicture ?? null
  }
}
