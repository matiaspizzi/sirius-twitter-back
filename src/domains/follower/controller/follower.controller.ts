/* eslint-disable @typescript-eslint/naming-convention */
import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db } from '@utils'

import { FollowerRepositoryImpl } from '../repository'
import { FollowerService, FollowerServiceImpl } from '../service'
import { UserRepositoryImpl } from '@domains/user/repository'

export const followerRouter = Router()

// Use dependency injection
const service: FollowerService = new FollowerServiceImpl(new FollowerRepositoryImpl(db), new UserRepositoryImpl(db))

/**
 * @swagger
 * /api/follower/follow/:user_id:
 *   post:
 *     security:
 *       - bearer: []
 *     summary: New follow
 *     tags: [Follow]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id to follow
 *     responses:
 *       200:
 *         description: The follow was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Follow'
 */
followerRouter.post('/follow/:user_id', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { user_id } = req.params

  const followed = await service.createFollow(userId, user_id)

  return res.status(HttpStatus.CREATED).json(followed)
})

/**
 * @swagger
 * /api/follower/unfollow/:user_id:
 *   post:
 *     security:
 *       - bearer: []
 *     summary: Delete follow
 *     tags: [Follow]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id to unfollow
 *     responses:
 *       200:
 *         description: The unfollow was successfully done
 *         content:
 *           application/json:
 *             example:
 *               message: Unfollowed
 */
followerRouter.post('/unfollow/:user_id', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { user_id } = req.params

  await service.deleteFollow(userId, user_id)

  return res.status(HttpStatus.OK).json({ message: 'Unfollowed' })
})

followerRouter.get('/doesFollow/:user_id', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { user_id } = req.params

  const doesFollow = await service.doesFollowExist(userId, user_id)

  return res.status(HttpStatus.OK).json({ doesFollow })
})

followerRouter.get('/followers/:user_id', async (req: Request, res: Response) => {
  const { user_id } = req.params

  const followers = await service.getFollowers(user_id)

  return res.status(HttpStatus.OK).json(followers)
})

followerRouter.get('/followings/:user_id', async (req: Request, res: Response) => {
  const { user_id } = req.params

  const followings = await service.getFollows(user_id)

  return res.status(HttpStatus.OK).json(followings)
})

followerRouter.get('/mutual', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const mutuals = await service.getMutuals(userId)
  console.log(mutuals)
  return res.status(HttpStatus.OK).json(mutuals)
})
