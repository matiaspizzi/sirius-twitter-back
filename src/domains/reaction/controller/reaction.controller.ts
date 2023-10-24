import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db } from '@utils'

import { ReactionRepositoryImpl } from '../repository'
import { ReactionService, ReactionServiceImpl } from '../service'

export const reactionRouter = Router()

// Use dependency injection
const service: ReactionService = new ReactionServiceImpl(new ReactionRepositoryImpl(db))

/**
 * @swagger
 * /api/reaction/:post_id:
 *   post:
 *     security:
 *       - bearer: []
 *     summary: Create reaction
 *     tags: [Reaction]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReactionInput'
 *     responses:
 *       200:
 *         description: OK
 */
reactionRouter.post('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params
  const { type } = req.body

  const reaction = await service.createReaction(userId, postId, type)
  return res.status(HttpStatus.OK).json(reaction)
})

/**
 * @swagger
 * /api/reaction/:post_id:
 *   delete:
 *     security:
 *       - bearer: []
 *     summary: Delete reaction
 *     tags: [Reaction]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReactionInput'
 *     responses:
 *       200:
 *         description: OK
 */
reactionRouter.delete('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params
  const { type } = req.body

  await service.deleteReaction(userId, postId, type)
  return res.status(HttpStatus.OK).send({ message: `Deleted reaction ${type} in post ${postId}` })
})
