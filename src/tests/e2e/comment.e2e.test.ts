import supertest from 'supertest'
import { app, server } from '../../server'
import { db } from '../../utils/database'

const api = supertest(app)

let token = ''
let postId = ''
let userId = ''

beforeAll(async () => {
  await db.user.deleteMany()
  await db.post.deleteMany()
  await db.reaction.deleteMany()

  const data = await api.post('/api/auth/signup').send({
    email: 'm@p.com',
    username: 'mp',
    password: 'Asdasd*123'
  })

  token = data.body.token as string
  userId = data.body.userId as string

  const res = await api.post('/api/post').set('Authorization', `Bearer ${token}`).send({
    content: 'test'
  })
  const post = res.body
  postId = post.id as string
})

afterAll(async () => {
  await db.$disconnect()
  server.close()
})

let commentId = ''

describe('POST /api/comment/:postId', () => {
  test('should return 404 NOT FOUND when post does not exist', async () => {
    const res = await api.post('/api/comment/80f29385-cab9-47d5-997c-0fb8362b8030').set('Authorization', `Bearer ${token}`).send({
      content: 'test'
    })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      code: 404,
      message: "Not found. Couldn't find post"
    })
  })

  test('should return 400 BAD REQUEST when content is empty', async () => {
    const res = await api.post(`/api/comment/${postId}`).set('Authorization', `Bearer ${token}`).send({
      content: ''
    })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      code: 400,
      errors: [
        {
          children: [],
          constraints: {
            isNotEmpty: 'content should not be empty'
          },
          property: 'content'
        }
      ],
      message: 'Validation Error'
    })
  })

  test('should return 201 CREATED', async () => {
    const res = await api.post(`/api/comment/${postId}`).set('Authorization', `Bearer ${token}`).send({
      content: 'test'
    })

    expect(res.status).toBe(201)
    expect(res.body).toEqual({
      id: expect.any(String),
      authorId: expect.any(String),
      content: 'test',
      parentId: postId,
      createdAt: expect.any(String),
      images: []
    })

    commentId = res.body.id
  })
})

describe('GET /api/comment/:postId', () => {
  test('should return 404 NOT FOUND when post does not exist', async () => {
    const res = await api.get('/api/comment/80f29385-cab9-47d5-997c-0fb8362b8030').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      code: 404,
      message: "Not found. Couldn't find post"
    })
  })

  test('should return 200 OK', async () => {
    const res = await api.get(`/api/comment/${postId}?limit=10?`).set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual([{
      id: expect.any(String),
      authorId: expect.any(String),
      content: 'test',
      parentId: postId,
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
      },
      createdAt: expect.any(String),
      images: [],
      qtyComments: 0,
      qtyLikes: 0,
      qtyRetweets: 0
    }])
  })
})

describe('GET /api/comment/by_user/:userId', () => {
  test('should return 404 NOT FOUND when user does not exist', async () => {
    const res = await api.get('/api/comment/by_user/80f29385-cab9-47d5-997c-0fb8362b8030').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      code: 404,
      message: "Not found. Couldn't find user"
    })
  })

  test('should return 200 OK', async () => {
    const res = await api.get(`/api/comment/by_user/${userId}`).set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual([{
      id: expect.any(String),
      authorId: expect.any(String),
      content: 'test',
      parentId: postId,
      createdAt: expect.any(String),
      images: []
    }])
  })
})

describe('DELETE /api/comment/:commentId', () => {
  test('should return 404 NOT FOUND when comment does not exist', async () => {
    const res = await api.delete('/api/comment/80f29385-cab9-47d5-997c-0fb8362b8030').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      code: 404,
      message: "Not found. Couldn't find comment"
    })
  })

  test('should return 403 FORBIDDEN when user is not the author', async () => {
    const data = await api.post('/api/auth/signup').send({
      email: 'mm@p.com',
      username: 'mmp',
      password: 'Asdasd*123'
    })

    const anotherToken = data.body.token as string

    const res = await api.delete(`/api/comment/${commentId}`).set('Authorization', `Bearer ${anotherToken}`)
    expect(res.status).toBe(403)
    expect(res.body).toEqual({
      code: 403,
      message: 'Forbidden. You are not allowed to perform this action'
    })
  })

  test('should return 200 OK', async () => {
    const res = await api.delete(`/api/comment/${commentId}`).set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ message: `Deleted comment ${commentId}` })
  })
})
