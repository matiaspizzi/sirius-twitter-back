import { describe, test } from '@jest/globals'
import { CreatePostInputDTO, PostDTO, ExtendedPostDTO } from '../../../domains/post/dto'
import { db } from '../../../utils'
import { PostService, PostServiceImpl } from '../../../domains/post/service'
import { PostRepository, PostRepositoryImpl } from '../../../domains/post/repository'
import { FollowerRepository, FollowerRepositoryImpl } from '../../../domains/follower/repository'
import { UserRepository, UserRepositoryImpl } from '../../../domains/user/repository'
import { NotFoundException, ValidationException } from '../../../utils/errors'
import { FollowerDTO } from '@domains/follower/dto'

describe('PostService', () => {
  const postRepositoryMock: PostRepository = new PostRepositoryImpl(db)
  const followerRepositoryMock: FollowerRepository = new FollowerRepositoryImpl(db)
  const userRepositoryMock: UserRepository = new UserRepositoryImpl(db)
  const postService: PostService = new PostServiceImpl(postRepositoryMock, followerRepositoryMock, userRepositoryMock)

  const author = { id: '1', name: 'name', username: 'username', email: 'email', password: 'password', isPrivate: false, createdAt: new Date(), profilePicture: null }
  const post: ExtendedPostDTO = { id: '1', authorId: '1', content: 'content', createdAt: new Date(), images: [], parentId: null, author, qtyComments: 0, qtyLikes: 0, qtyRetweets: 0 }
  const createPost: CreatePostInputDTO = { content: 'content', images: [] }
  const follower: FollowerDTO = { followerId: '2', followedId: post.authorId, id: '1', createdAt: new Date() }

  test('createPost() should return a PostDTO object', async () => {
    jest.spyOn(postRepositoryMock, 'create').mockImplementation(async () => await Promise.resolve(post))
    const postCreated: PostDTO = await postService.createPost(post.authorId, createPost)

    expect(postCreated.id).toBeDefined()
    expect(postCreated.authorId).toEqual(post.authorId)
    expect(postCreated.content).toEqual(post.content)
    expect(postCreated.images).toEqual(post.images)
    expect(postCreated.parentId).toEqual(post.parentId)
  })

  test('createPost() should throw a ValidationException when content is empty', async () => {
    try {
      await postService.createPost(post.authorId, { content: '', images: [] })
    } catch (error: any) {
      expect(error).toBeInstanceOf(ValidationException)
    }
  })

  test('deletePost() should work', async () => {
    jest.spyOn(postRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(post))
    jest.spyOn(postRepositoryMock, 'delete').mockImplementation(async () => { await Promise.resolve() })
    await postService.deletePost(post.authorId, post.id)
    expect(postRepositoryMock.delete).toBeCalledWith(post.id)
  })

  test('deletePost() should throw a NotFoundException when post does not exist', async () => {
    jest.spyOn(postRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    try {
      await postService.deletePost(post.authorId, post.id)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('getPost() should return a PostDTO object', async () => {
    jest.spyOn(postRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(post as PostDTO))
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(author))
    const postFound: PostDTO = await postService.getPost(post.authorId, post.id)

    expect(postFound.id).toBeDefined()
    expect(postFound.authorId).toEqual(post.authorId)
    expect(postFound.content).toEqual(post.content)
    expect(postFound.images).toEqual(post.images)
    expect(postFound.parentId).toEqual(post.parentId)
  })

  test('getPost() should throw a NotFoundException when author is private and user does not follow them', async () => {
    jest.spyOn(postRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(post as PostDTO))
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve({ ...author, isPrivate: true }))
    jest.spyOn(followerRepositoryMock, 'getByIds').mockImplementation(async () => await Promise.resolve(null))
    try {
      await postService.getPost(post.authorId, post.id)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('getPost() should throw a NotFoundException when post does not exist', async () => {
    jest.spyOn(postRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    try {
      await postService.getPost(post.authorId, post.id)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('getLatestPosts() should return a PostDTO object', async () => {
    jest.spyOn(postRepositoryMock, 'getAllByDatePaginated').mockImplementation(async () => await Promise.resolve([post]))
    jest.spyOn(followerRepositoryMock, 'getByIds').mockImplementation(async () => await Promise.resolve(follower))
    const postsFound = await postService.getLatestPosts('2', { limit: 1 })

    expect(postsFound[0].id).toBeDefined()
    expect(postsFound[0].authorId).toEqual(post.authorId)
    expect(postsFound[0].content).toEqual(post.content)
    expect(postsFound[0].images).toEqual(post.images)
    expect(postsFound[0].parentId).toEqual(post.parentId)
  })

  test('getLatestPosts() should return an empty array when user does not follow anyone', async () => {
    jest.spyOn(postRepositoryMock, 'getAllByDatePaginated').mockImplementation(async () => await Promise.resolve([]))
    jest.spyOn(followerRepositoryMock, 'getByIds').mockImplementation(async () => await Promise.resolve(null))

    const postsFound = await postService.getLatestPosts('2', { limit: 1 })
    expect(postsFound).toEqual([])
  })

  test('getPostsByAuthor() should return a PostDTO object', async () => {
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(author))
    jest.spyOn(postRepositoryMock, 'getByAuthorId').mockImplementation(async () => await Promise.resolve([post]))
    const postsFound = await postService.getPostsByAuthor('2', post.authorId)

    expect(postsFound[0].id).toBeDefined()
    expect(postsFound[0].authorId).toEqual(post.authorId)
    expect(postsFound[0].content).toEqual(post.content)
    expect(postsFound[0].images).toEqual(post.images)
    expect(postsFound[0].parentId).toEqual(post.parentId)
  })

  test('getPostsByAuthor() should throw a NotFoundException when author does not exist', async () => {
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    try {
      await postService.getPostsByAuthor('2', post.authorId)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('getPostsByAuthor() should throw a NotFoundException when author is private and user does not follow them', async () => {
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve({ ...author, isPrivate: true }))
    jest.spyOn(followerRepositoryMock, 'getByIds').mockImplementation(async () => await Promise.resolve(null))
    try {
      await postService.getPostsByAuthor('2', post.authorId)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('getPostsByAuthor() should return a PostDTO object when author is private and user follows them', async () => {
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve({ ...author, isPrivate: true }))
    jest.spyOn(followerRepositoryMock, 'getByIds').mockImplementation(async () => await Promise.resolve(follower))
    jest.spyOn(postRepositoryMock, 'getByAuthorId').mockImplementation(async () => await Promise.resolve([post]))
    const postsFound = await postService.getPostsByAuthor('2', post.authorId)

    expect(postsFound[0].id).toBeDefined()
    expect(postsFound[0].authorId).toEqual(post.authorId)
    expect(postsFound[0].content).toEqual(post.content)
    expect(postsFound[0].images).toEqual(post.images)
    expect(postsFound[0].parentId).toEqual(post.parentId)
  })

  test('setPostImage() should return a presignedUrl and filename', async () => {
    const presignedData = await postService.setPostImage()
    expect(presignedData.presignedUrl).toBeDefined()
    expect(presignedData.filename).toBeDefined()
  })

  test('addQtyLikes() should work', async () => {
    jest.spyOn(postRepositoryMock, 'addQtyLikes').mockImplementation(async () => { await Promise.resolve() })
    await postService.addQtyLikes(post.id)
    expect(postRepositoryMock.addQtyLikes).toBeCalledWith(post.id)
  })

  test('subtractQtyLikes() should work', async () => {
    jest.spyOn(postRepositoryMock, 'subtractQtyLikes').mockImplementation(async () => { await Promise.resolve() })
    await postService.subtractQtyLikes(post.id)
    expect(postRepositoryMock.subtractQtyLikes).toBeCalledWith(post.id)
  })

  test('addQtyRetweets() should work', async () => {
    jest.spyOn(postRepositoryMock, 'addQtyRetweets').mockImplementation(async () => { await Promise.resolve() })
    await postService.addQtyRetweets(post.id)
    expect(postRepositoryMock.addQtyRetweets).toBeCalledWith(post.id)
  })

  test('subtractQtyRetweets() should work', async () => {
    jest.spyOn(postRepositoryMock, 'subtractQtyRetweets').mockImplementation(async () => { await Promise.resolve() })
    await postService.subtractQtyRetweets(post.id)
    expect(postRepositoryMock.subtractQtyRetweets).toBeCalledWith(post.id)
  })

  test('addQtyComments() should work', async () => {
    jest.spyOn(postRepositoryMock, 'addQtyComments').mockImplementation(async () => { await Promise.resolve() })
    await postService.addQtyComments(post.id)
    expect(postRepositoryMock.addQtyComments).toBeCalledWith(post.id)
  })

  test('subtractQtyComments() should work', async () => {
    jest.spyOn(postRepositoryMock, 'subtractQtyComments').mockImplementation(async () => { await Promise.resolve() })
    await postService.subtractQtyComments(post.id)
    expect(postRepositoryMock.subtractQtyComments).toBeCalledWith(post.id)
  })
})
