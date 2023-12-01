import { CreatePostInputDTO, PostDTO, ExtendedPostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { FollowerRepository } from '@domains/follower/repository'
import { UserRepository } from '@domains/user/repository'
import { validate } from 'class-validator'
import { ForbiddenException, NotFoundException } from '@utils'
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

  async getPost (userId: string, postId: string): Promise<PostDTO> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    const author = await this.userRepository.getById(post.authorId)
    if (author) {
      if (author.isPrivate) {
        const doesFollow = await this.followerRepository.getByIds(userId, author.id)
        if (!doesFollow) throw new NotFoundException('post')
      }
    } else {
      throw new NotFoundException('user')
    }
    return post
  }

  async getLatestPostsFollowing (userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    // DID: filter post search to return posts from authors that the user follows
    const posts = await this.repository.getAllByDatePaginated(options)
    const filteredPosts = []
    for (const post of posts) {
      const doesFollow = await this.followerRepository.getByIds(userId, post.author.id)
      if (doesFollow || post.authorId == userId) filteredPosts.push(post)
    }
    return filteredPosts
  }

  async getLatestPosts (userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    const posts = await this.repository.getAllByDatePaginated(options)
    const filtered: ExtendedPostDTO[] = []
    posts.forEach(async (post) => {
      if(post.author.isPrivate) {
        const doesFollow = await this.followerRepository.getByIds(userId, post.author.id)
        if (doesFollow) filtered.push(post)
      }
      else filtered.push(post)
    })
    return filtered
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
    const presignedData = await generateS3UploadUrl()
    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${presignedData.filename}.jpeg`
    const data = {
      presignedUrl: presignedData.presignedUrl,
      fileUrl
    }
    return data
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
