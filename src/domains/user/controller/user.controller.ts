import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
import 'express-async-errors'

import { db } from '@utils'

import { UserRepositoryImpl } from '../repository'
import { UserService, UserServiceImpl } from '../service'

export const userRouter = Router()

// Use dependency injection
const service: UserService = new UserServiceImpl(new UserRepositoryImpl(db))

/**
 * @swagger
 * /api/user:
 *   get:
 *     security:
 *       - bearer: []
 *     summary: Get user recommendations
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: The number of users to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         required: false
 *         description: The number of users to skip
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
userRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, skip } = req.query as Record<string, string>

  const users = await service.getUserRecommendations(userId, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json(users)
})

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     security:
 *       - bearer: []
 *     summary: Get my user
 *     tags: [User]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
userRouter.get('/me', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const user = await service.getUserView(userId)

  return res.status(HttpStatus.OK).json(user)
})

userRouter.get('/by_username/:username', async (req: Request, res: Response) => {
  const { username } = req.params
  const { limit, skip } = req.query as Record<string, string>

  const users = await service.getUsersByUsername(username, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json(users)
})

/**
 * @swagger
 * /api/user:
 *   delete:
 *     security:
 *       - bearer: []
 *     summary: Delete user
 *     tags: [User]
 *     responses:
 *       200:
 *         description: OK
 */
userRouter.delete('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  await service.deleteUser(userId)

  return res.status(HttpStatus.OK)
})

/**
 * @swagger
 * /api/user/private/:is_private:
 *   post:
 *     security:
 *       - bearer: []
 *     summary: Set user private
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: is_private
 *         schema:
 *           type: boolean
 *         required: true
 *         description: Set user private
 *     responses:
 *       200:
 *         description: OK
 */
userRouter.post('/private/:isPrivate', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { isPrivate } = req.params

  const setted = await service.setPrivate(userId, isPrivate)
  return res.status(HttpStatus.OK).send({ private: setted })
})

userRouter.get('/profilePicture/presignedUrl', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const preSignedUrl = await service.setProfilePicture(userId)
  if (preSignedUrl !== null) return res.status(HttpStatus.OK).send({ preSignedUrl })
})

userRouter.get('/profilePicture', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const profilePictureUrl = await service.getProfilePicture(userId)
  if (profilePictureUrl !== null) return res.status(HttpStatus.OK).send({ profilePictureUrl })
})

/**
 * @swagger
 * /api/user/:user_id:
 *   get:
 *     security:
 *       - bearer: []
 *     summary: Get user by id
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
userRouter.get('/:userId', async (req: Request, res: Response) => {
  const { userId: otherUserId } = req.params

  const user = await service.getUserView(otherUserId)

  return res.status(HttpStatus.OK).json(user)
})
