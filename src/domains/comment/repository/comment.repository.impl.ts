import { PrismaClient } from '@prisma/client'
import { CommentRepository } from '.'
import { CreateCommentInputDTO } from '../dto'
import { PostDTO } from '@domains/post/dto'

export class CommentRepositoryImpl implements CommentRepository {
  constructor (private readonly db: PrismaClient) {}

  async create (userId: string, data: CreateCommentInputDTO): Promise<PostDTO> {
    const comment = await this.db.post.create({
      data: {
        authorId: userId,
        ...data
      }
    })
    return new PostDTO(comment)
  }

  async getAllByPostId (postId: string): Promise<PostDTO[]> {
    const comments = await this.db.post.findMany({
      where: {
        parentId: postId
      },
      orderBy: [
        {
          createdAt: 'asc'
        }
      ]
    })
    return comments.map(comment => new PostDTO(comment))
  }

  async delete (postId: string): Promise<void> {
    await this.db.post.delete({
      where: {
        id: postId
      }
    })
  }

  async getById (postId: string): Promise<PostDTO | null> {
    const post = await this.db.post.findUnique({
      where: {
        id: postId
      }
    })
    return (post != null) ? new PostDTO(post) : null
  }

  async getByAuthorId (authorId: string): Promise<PostDTO[]> {
    const posts = await this.db.post.findMany({
      where: {
        authorId
      }
    })
    return posts.map(post => new PostDTO(post))
  }
}
