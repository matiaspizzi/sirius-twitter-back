import { CreateCommentInputDTO } from '../dto'
import { PostDTO, ExtendedPostDTO } from '@domains/post/dto'
import { CommentRepository } from '../repository'
import { CommentService } from '.'
import { FollowerRepository } from '@domains/follower/repository'
import { validate } from 'class-validator'
import { ForbiddenException, NotFoundException } from '@utils'
import { CursorPagination } from '@types'
import { PostRepository } from '@domains/post/repository'
import { UserRepository } from '@domains/user/repository'

export class CommentServiceImpl implements CommentService {
  constructor (
    private readonly repository: CommentRepository,
    private readonly followerRepository: FollowerRepository,
    private readonly userRepository: UserRepository,
    private readonly postRepository: PostRepository
  ) {}

  async createComment (userId: string, data: CreateCommentInputDTO): Promise<PostDTO> {
    await validate(data)
    const post = await this.postRepository.getById(data.parentId)
    if (!post) throw new NotFoundException('post')
    await this.postRepository.addQtyComments(data.parentId)
    return await this.repository.create(userId, data)
  }

  async deleteComment (userId: string, commentId: string): Promise<void> {
    const comment = await this.repository.getById(commentId)
    if (!comment?.parentId) throw new NotFoundException('comment')
    if (comment.authorId !== userId) throw new ForbiddenException()
    await this.postRepository.subtractQtyComments(comment?.parentId)
    await this.repository.delete(commentId)
  }

  async getComment (userId: string, commentId: string): Promise<PostDTO> {
    const comment = await this.repository.getById(commentId)
    if (!comment) throw new NotFoundException('comment')
    const author = await this.userRepository.getById(comment.authorId)
    if (author?.isPrivate === true) {
      const doesFollow = await this.followerRepository.getByIds(userId, author.id)
      if (!doesFollow) throw new NotFoundException('comment')
    }
    return comment
  }

  async getCommentsByAuthor (userId: any, authorId: string): Promise<PostDTO[]> {
    const author = await this.userRepository.getById(authorId)
    if (!author) throw new NotFoundException('user')
    const doesFollowExist = await this.followerRepository.getByIds(userId, authorId)
    if (!doesFollowExist && author.isPrivate) throw new NotFoundException('comment')
    return await this.repository.getByAuthorId(authorId)
  }

  async getCommentsByPost (userId: string, postId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    const post = await this.postRepository.getById(postId)
    if (!post) throw new NotFoundException('post')
    const author = await this.userRepository.getById(post.authorId)
    if (!author) throw new NotFoundException('user')
    const doesFollowExist = await this.followerRepository.getByIds(userId, author.id)
    if (!doesFollowExist && author.isPrivate) throw new NotFoundException('comment')
    return await this.repository.getAllByPostId(postId, options)
  }
}
