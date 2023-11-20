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

describe('POST /api/reaction/:postId', () => {
  test('should return 200 OK', async () => {
    const res = await api.post(`/api/reaction/${postId}?type=LIKE`).set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      id: expect.any(String),
      postId: expect.any(String),
      userId: expect.any(String),
      type: 'LIKE'
    })
  })
})

describe('GET /api/reaction/:userId', () => {
  test('should return 200 OK', async () => {
    const res = await api.get(`/api/reaction/${userId}?type=LIKE`).set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual([{
      id: expect.any(String),
      postId: expect.any(String),
      userId: expect.any(String),
      type: 'LIKE'
    }])
  })
})

describe('DELETE /api/reaction/:postId', () => {
  test('should return 200 OK', async () => {
    const res = await api.delete(`/api/reaction/${postId}?type=LIKE`).set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ message: `Deleted reaction LIKE in post ${postId}` })
  })
})
