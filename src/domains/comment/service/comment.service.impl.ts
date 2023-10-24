import { CreateCommentInputDTO } from '../dto'
import { PostDTO } from '@domains/post/dto'
import { CommentRepository } from '../repository'
import { CommentService } from '.'
import { FollowerRepositoryImpl } from '@domains/follower/repository'
import { FollowerServiceImpl } from '@domains/follower/service'
import { UserServiceImpl } from '@domains/user/service'
import { UserRepositoryImpl } from '@domains/user/repository'
import { validate } from 'class-validator'
import { ForbiddenException, NotFoundException, db } from '@utils'

const followerService = new FollowerServiceImpl(new FollowerRepositoryImpl(db))
const userService = new UserServiceImpl(new UserRepositoryImpl(db))

export class CommentServiceImpl implements CommentService {
  constructor (private readonly repository: CommentRepository) {}

  async createComment (userId: string, data: CreateCommentInputDTO): Promise<PostDTO> {
    await validate(data)
    return await this.repository.create(userId, data)
  }

  async deleteComment (userId: string, commentId: string): Promise<void> {
    const comment = await this.repository.getById(commentId)
    if (!comment) throw new NotFoundException('comment')
    if (comment.authorId !== userId) throw new ForbiddenException()
    await this.repository.delete(commentId)
  }

  async getComment (userId: string, commentId: string): Promise<PostDTO> {
    const comment = await this.repository.getById(commentId)
    if (!comment) throw new NotFoundException('comment')
    const author = await userService.getUser(comment.authorId)
    if (author.isPrivate) {
      const doesFollow = await followerService.doesFollowExist(userId, author.id)
      if (!doesFollow) throw new NotFoundException('comment')
    }
    return comment
  }

  async getCommentsByAuthor (userId: any, authorId: string): Promise<PostDTO[]> {
    const doesFollowExist = await followerService.doesFollowExist(userId, authorId)
    const author = await userService.getUser(authorId)
    if (!doesFollowExist && author.isPrivate) throw new NotFoundException('comment')
    return await this.repository.getByAuthorId(authorId)
  }

  async getCommentsByPost (userId: string, postId: string): Promise<PostDTO[]> {
    const doesFollowExist = await followerService.doesFollowExist(userId, postId)
    const author = await userService.getUser(postId)
    if (!doesFollowExist && author.isPrivate) throw new NotFoundException('comment')
    return await this.repository.getAllByPostId(postId)
  }
}
