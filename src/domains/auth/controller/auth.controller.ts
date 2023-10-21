import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db, BodyValidation } from '@utils'
import { UserRepositoryImpl } from '@domains/user/repository'

import { AuthService, AuthServiceImpl } from '../service'
import { LoginInputDTO, SignupInputDTO } from '../dto'

export const authRouter = Router()

// Use dependency injection
const service: AuthService = new AuthServiceImpl(new UserRepositoryImpl(db))

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Signup
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupInput'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 */
authRouter.post('/signup', BodyValidation(SignupInputDTO), async (req: Request, res: Response) => {
  const data = req.body

  const token = await service.signup(data)

  return res.status(HttpStatus.CREATED).json(token)
})

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login - You only need to send either username or email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 */
authRouter.post('/login', BodyValidation(LoginInputDTO), async (req: Request, res: Response) => {
  const data = req.body

  const token = await service.login(data)

  return res.status(HttpStatus.OK).json(token)
})
