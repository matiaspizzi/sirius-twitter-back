import { CreatePostInputDTO, PostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { FollowerRepositoryImpl } from '@domains/follower/repository'
import { FollowerServiceImpl } from '@domains/follower/service'
import { UserServiceImpl } from '@domains/user/service'
import { UserRepositoryImpl } from '@domains/user/repository'
import { validate } from 'class-validator'
import { ForbiddenException, NotFoundException, db } from '@utils'
import { CursorPagination } from '@types'

const followerService = new FollowerServiceImpl(new FollowerRepositoryImpl(db))
const userService = new UserServiceImpl(new UserRepositoryImpl(db))

export class PostServiceImpl implements PostService {
  constructor (private readonly repository: PostRepository) {}

  async createPost (userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    await validate(data)
    return await this.repository.create(userId, data)
  }

  async deletePost (userId: string, postId: string): Promise<void> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    if (post.authorId !== userId) throw new ForbiddenException()
    await this.repository.delete(postId)
  }

  async getPost (userId: string, postId: string): Promise<PostDTO> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    const author = await userService.getUser(post.authorId)
    if (author.isPrivate) {
      const doesFollow = await followerService.doesFollowExist(userId, author.id)
      if (!doesFollow) throw new NotFoundException('post')
    }
    return post
  }

  async getLatestPosts (userId: string, options: CursorPagination): Promise<PostDTO[]> {
    // DID: filter post search to return posts from authors that the user follows
    const posts = await this.repository.getAllByDatePaginated(options)
    const filteredPosts = [] as PostDTO[]
    posts.forEach(async post => {
      const author = await userService.getUser(post.authorId)
      const doesFollow = await followerService.doesFollowExist(userId, author.id)
      if (doesFollow) filteredPosts.push(post)
    })
    return filteredPosts
  }

  async getPostsByAuthor (userId: any, authorId: string): Promise<PostDTO[]> {
    // DID: throw exception when the author has a private profile and the user doesn't follow them
    const doesFollowExist = await followerService.doesFollowExist(userId, authorId)
    const author = await userService.getUser(authorId)
    if (!doesFollowExist && author.isPrivate) throw new NotFoundException('post')
    return await this.repository.getByAuthorId(authorId)
  }
}
