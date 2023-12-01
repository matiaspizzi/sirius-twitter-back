import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'
import { db, BodyValidation } from '@utils'
import { PostRepositoryImpl } from '../repository'
import { PostService, PostServiceImpl } from '../service'
import { CreatePostInputDTO } from '../dto'
import { FollowerRepositoryImpl } from '@domains/follower/repository'
import { UserRepositoryImpl } from '@domains/user/repository'

export const postRouter = Router()

// Use dependency injection
const service: PostService = new PostServiceImpl(
  new PostRepositoryImpl(db),
  new FollowerRepositoryImpl(db),
  new UserRepositoryImpl(db)
)

/**
 * @swagger
 * /api/post:
 *   get:
 *     security:
 *       - bearer: []
 *     summary: Get latest posts
 *     tags: [Post]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: The number of posts to return
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *         required: false
 *         description: The cursor to the previous page
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *         required: false
 *         description: The cursor to the next page
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 */
postRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, before, after } = req.query as Record<string, string>

  const posts = await service.getLatestPosts(userId, { limit: Number(limit), before, after })

  return res.status(HttpStatus.OK).json(posts)
})


postRouter.get('/following', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, before, after } = req.query as Record<string, string>

  const posts = await service.getLatestPostsFollowing(userId, { limit: Number(limit), before, after })

  return res.status(HttpStatus.OK).json(posts)
})

/**
 * @swagger
 * /api/post/:post_id:
 *   get:
 *     security:
 *       - bearer: []
 *     summary: Get post by id
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 */
postRouter.get('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  const post = await service.getPost(userId, postId)

  return res.status(HttpStatus.OK).json(post)
})

/**
 * @swagger
 * /api/post/by_user/:user_id:
 *   get:
 *     security:
 *       - bearer: []
 *     summary: Get posts by author
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The author id
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 */
postRouter.get('/by_user/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { userId: authorId } = req.params

  const posts = await service.getPostsByAuthor(userId, authorId)

  return res.status(HttpStatus.OK).json(posts)
})

/**
 * @swagger
 * /api/post:
 *   post:
 *     security:
 *       - bearer: []
 *     summary: Create post
 *     tags: [Post]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostInput'
 *     responses:
 *       201:
 *         description: The post was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 */
postRouter.post('/', BodyValidation(CreatePostInputDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const data = req.body
  const post = await service.createPost(userId, data)

  return res.status(HttpStatus.CREATED).json(post)
})

/**
 * @swagger
 * /api/post/:post_id:
 *   delete:
 *     security:
 *       - bearer: []
 *     summary: Delete post
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     responses:
 *       200:
 *         description: The post was successfully deleted
 *         content:
 *           application/json:
 *             example:
 *               message: Deleted post {post_id}
 */
postRouter.delete('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  await service.deletePost(userId, postId)

  return res.status(HttpStatus.OK).send({ message: `Deleted post ${postId}` })
})

postRouter.get('/image/presignedUrl', async (req: Request, res: Response) => {
  const data = await service.setPostImage()
  if (data !== null) return res.status(HttpStatus.OK).send({ data })
})
