import supertest from 'supertest'
import { app, server } from '../../server'
import { db } from '../../utils/database'

const api = supertest(app)

let token = ''
let userId = ''
let anotherUserId = ''
let anotherToken = ''

beforeAll(async () => {
  await db.user.deleteMany()
  await db.post.deleteMany()
  await db.reaction.deleteMany()

  const data = await api.post('/api/auth/signup').send({
    email: 'm@p.com',
    username: 'mp',
    password: 'Asdasd*123'
  })

  const data2 = await api.post('/api/auth/signup').send({
    email: 'mm@p.com',
    username: 'mmp',
    password: 'Asdasd*123'
  })

  token = data.body.token as string
  userId = data.body.userId as string
  anotherUserId = data2.body.userId as string
  anotherToken = data2.body.token as string
})

afterAll(async () => {
  await db.$disconnect()
  server.close()
})

describe('POST /api/message/:receiverId', () => {
  test('should return 404 NOT FOUND when users do not follow eachother', async () => {
    const res = await api.post(`/api/message/${anotherUserId}`).set('Authorization', `Bearer ${token}`).send({
      content: 'Hello'
    })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      code: 404,
      message: "Not found. Couldn't find user"
    })
  })

  test('should return 201 if message is sent', async () => {
    await api.post(`/api/follower/follow/${anotherUserId}`).set('Authorization', `Bearer ${token}`)
    await api.post(`/api/follower/follow/${userId}`).set('Authorization', `Bearer ${anotherToken}`)

    const res = await api.post(`/api/message/${anotherUserId}`).set('Authorization', `Bearer ${token}`).send({
      content: 'Hello'
    })

    expect(res.status).toBe(201)
    expect(res.body).toEqual({
      id: expect.any(String),
      content: 'Hello',
      senderId: userId,
      receiverId: anotherUserId,
      createdAt: expect.any(String)
    })
  })
})

describe('GET /api/message/:receiverId', () => {
  test('should return 404 NOT FOUND when receiver does not exist', async () => {
    const res = await api.get('/api/message/80f29385-cab9-47d5-997c-0fb8362b8030').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      code: 404,
      message: "Not found. Couldn't find user"
    })
  })

  test('should return 200 OK', async () => {
    const res = await api.get(`/api/message/${anotherUserId}`).set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual([{
      id: expect.any(String),
      content: 'Hello',
      senderId: userId,
      receiverId: anotherUserId,
      createdAt: expect.any(String)
    }])
  })
})
