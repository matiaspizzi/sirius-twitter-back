import { Router } from 'express'
import { withAuth } from '@utils'

import { userRouter } from '@domains/user'
import { postRouter } from '@domains/post'
import { authRouter } from '@domains/auth'
import { healthRouter } from '@domains/health'
import { followerRouter } from '@domains/follower'

export const router = Router()

router.use('/health', healthRouter)
router.use('/auth', authRouter)
router.use('/user', withAuth, userRouter)
router.use('/post', withAuth, postRouter)
router.use('/follower', withAuth, followerRouter)

// Swagger components
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearer:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated id
 *         username:
 *           type: string
 *           description: Unique username
 *         name:
 *           type: string
 *           description: Optional user's name
 *         email:
 *           type: string
 *           description: Unique email
 *         password:
 *           type: string
 *           description: Hashed password
 *         isPrivate:
 *           type: boolean
 *           description: True if the user is private
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the user was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the user was updated
 *         deletedAt:
 *           type: string
 *           format: date
 *           description: Optional date that the user was deleted
 *         posts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Post'
 *           description: User's posts
 *         followers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Follow'
 *           description: User's followers
 *         follows:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Follow'
 *           description: User's follows
 *     Post:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated id
 *         content:
 *           type: string
 *           description: Post content
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Image url
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the post was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the post was updated
 *         deletedAt:
 *           type: string
 *           format: date
 *           description: Optional date that the post was deleted
 *         author:
 *           $ref: '#/components/schemas/User'
 *     Follow:
 *       type: object
 *       required:
 *         - followerId
 *         - followedId
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated id
 *         followerId:
 *           type: string
 *           description: Follower id
 *         followedId:
 *           type: string
 *           description: Followed id
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the follow was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the follow was updated
 *         deletedAt:
 *           type: string
 *           format: date
 *           description: Optional date that the follow was deleted
 *         follower:
 *           $ref: '#/components/schemas/User'
 *         followed:
 *           $ref: '#/components/schemas/User'
 *     LoginInput:
 *       type: object
 *       required:
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: User's username
 *         email:
 *           type: string
 *           description: User's email
 *         password:
 *           type: string
 *           description: User's password
 *       example:
 *         email: 'ex@mple.com'
 *         username: 'test'
 *         password: 'Example123'
 *     SignupInput:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: User's username
 *         email:
 *           type: string
 *           description: User's email
 *         password:
 *           type: string
 *           description: User's password
 *       example:
 *         username: 'test'
 *         email: 'ex@ample.com'
 *         password: 'Example123'
 *     CreatePostInput:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: Post content
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             description: Image url
 *       example:
 *         content: 'Hello world!'
 *         images: ['https://example.com/image.png']
 */
