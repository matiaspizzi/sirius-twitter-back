import { CreatePostInputDTO, PostDTO, ExtendedPostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { FollowerRepository } from '@domains/follower/repository'
import { UserRepository } from '@domains/user/repository'
import { validate } from 'class-validator'
import { ForbiddenException, NotFoundException, Constants } from '@utils'
import { CursorPagination } from '@types'
import { generateS3UploadUrl } from '@utils/s3'

export class PostServiceImpl implements PostService {
  constructor (
    private readonly repository: PostRepository,
    private readonly followerRepository: FollowerRepository,
    private readonly userRepository: UserRepository
  ) {}

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

  async getPost (userId: string, postId: string): Promise<ExtendedPostDTO> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    if (post.author.isPrivate) {
      const doesFollow = await this.followerRepository.getByIds(userId, post.author.id)
      if (!doesFollow) throw new NotFoundException('post')
    }
    return post
  }

  async getLatestPosts (userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    // DID: filter post search to return posts from authors that the user follows
    const posts = await this.repository.getAllByDatePaginated(options)
    const filteredPosts = []
    for (const post of posts) {
      const doesFollow = await this.followerRepository.getByIds(userId, post.author.id)
      if (doesFollow != null || !post.author.isPrivate) filteredPosts.push(post)
    }
    return filteredPosts
  }

  async getPostsByAuthor (userId: any, authorId: string): Promise<ExtendedPostDTO[]> {
    // DID: throw exception when the author has a private profile and the user doesn't follow them
    const author = await this.userRepository.getById(authorId)
    if (author) {
      if (author.isPrivate) {
        const doesFollow = await this.followerRepository.getByIds(userId, author.id)
        if (!doesFollow) throw new NotFoundException('post')
      }
    } else {
      throw new NotFoundException('user')
    }
    return await this.repository.getByAuthorId(authorId)
  }

  async setPostImage (): Promise<{ presignedUrl: string, fileUrl: string }> {
    const data = await generateS3UploadUrl()
    const url = `https://${Constants.BUCKET_NAME}.s3.amazonaws.com/${data.filename}.jpeg`
    return { presignedUrl: data.presignedUrl, fileUrl: url }
  }

  async addQtyLikes (postId: string): Promise<void> {
    await this.repository.addQtyLikes(postId)
  }

  async subtractQtyLikes (postId: string): Promise<void> {
    await this.repository.subtractQtyLikes(postId)
  }

  async addQtyRetweets (postId: string): Promise<void> {
    await this.repository.addQtyRetweets(postId)
  }

  async subtractQtyRetweets (postId: string): Promise<void> {
    await this.repository.subtractQtyRetweets(postId)
  }

  async addQtyComments (postId: string): Promise<void> {
    await this.repository.addQtyComments(postId)
  }

  async subtractQtyComments (postId: string): Promise<void> {
    await this.repository.subtractQtyComments(postId)
  }
}
