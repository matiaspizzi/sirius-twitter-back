import supertest from 'supertest'
import { app, server } from '../../server'
import { db } from '../../utils/database'

const api = supertest(app)

let postId = ''
let token = ''
let userId = ''

beforeAll(async () => {
  await db.user.deleteMany()
  await db.post.deleteMany()

  const data = await api.post('/api/auth/signup').send({
    email: 'm@p.com',
    username: 'mp',
    password: 'Asdasd*123'
  })

  token = data.body.token as string
  userId = data.body.userId as string
})

afterAll(async () => {
  await db.$disconnect()
  server.close()
})

describe('POST /api/post', () => {
  test('should return 401 if missing token', async () => {
    const res = await api.post('/api/post').send({
      content: 'test'
    })

    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      code: 401,
      message: 'Unauthorized. You must login to access this content.',
      error: {
        error_code: 'MISSING_TOKEN'
      }
    })
  })

  test('should return 400 if missing fields', async () => {
    const res = await api.post('/api/post').set('Authorization', `Bearer ${token}`).send({})

    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      errors: [
        {
          property: 'content',
          children: [],
          constraints: {
            isNotEmpty: 'content should not be empty',
            isString: 'content must be a string',
            maxLength: 'content must be shorter than or equal to 240 characters'
          }
        }
      ],
      message: 'Validation Error',
      code: 400
    })
  })

  test('should return 201 CREATED', async () => {
    const res = await api.post('/api/post').set('Authorization', `Bearer ${token}`).send({
      content: 'test'
    })

    expect(res.status).toBe(201)
    expect(res.body).toEqual({
      id: expect.any(String),
      content: 'test',
      authorId: userId,
      images: [],
      createdAt: expect.any(String),
      parentId: null
    })

    postId = res.body.id as string
  })
})

describe('GET /api/post/:postId', () => {
  test('should return 200 OK', async () => {
    const res = await api.get(`/api/post/${postId}`).set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      id: expect.any(String),
      content: 'test',
      authorId: userId,
      images: [],
      createdAt: expect.any(String),
      parentId: null
    })
  })

  test('should return 404 if post not found', async () => {
    const res = await api.get(`/api/post/${userId}`).set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      code: 404,
      message: "Not found. Couldn't find post"
    })
  })
})

describe('GET /api/post/by_user/:userId', () => {
  test('should return 200 OK', async () => {
    const res = await api.get(`/api/post/by_user/${userId}`).set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual([{
      id: expect.any(String),
      content: 'test',
      authorId: userId,
      images: [],
      createdAt: expect.any(String),
      parentId: null,
      qtyComments: 0,
      qtyLikes: 0,
      qtyRetweets: 0,
      author: {
        createdAt: expect.any(String),
        deletedAt: null,
        email: 'm@p.com',
        id: userId,
        isPrivate: false,
        name: null,
        password: expect.any(String),
        profilePicture: null,
        updatedAt: expect.any(String),
        username: 'mp'
      }
    }])
  })

  test('should return 404 if user not found', async () => {
    const res = await api.get('/api/post/by_user/80f29385-cab9-47d5-997c-0fb8362b8030').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      code: 404,
      message: "Not found. Couldn't find user"
    })
  })
})

describe('DELETE /api/post/:postId', () => {
  test('should return 200 OK', async () => {
    const res = await api.delete(`/api/post/${postId}`).set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      message: `Deleted post ${postId}`
    })
  })

  test('should return 404 if post not found', async () => {
    const res = await api.delete(`/api/post/${userId}`).set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      code: 404,
      message: "Not found. Couldn't find post"
    })
  })
})
