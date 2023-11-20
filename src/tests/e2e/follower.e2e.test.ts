import supertest from 'supertest'
import { app, server } from '../../server'
import { db } from '../../utils/database'

const api = supertest(app)

let token = ''
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
})

afterAll(async () => {
  await db.$disconnect()
  server.close()
})

let anotherUser = ''

describe('POST /api/follower/follow/:user_id', () => {
  test('should return 403 FORBIDDEN', async () => {
    const res = await api.post(`/api/follower/follow/${userId}`).set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
    expect(res.body).toEqual({
      code: 403,
      message: 'Forbidden. You are not allowed to perform this action'
    })
  })

  test('should return 404 NOT FOUND when user does not exist', async () => {
    const res = await api.post('/api/follower/follow/80f29385-cab9-47d5-997c-0fb8362b8030').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      code: 404,
      message: "Not found. Couldn't find user"
    })
  })

  test('should return 200 OK', async () => {
    const data = await api.post('/api/auth/signup').send({
      email: 'mm@p.com',
      username: 'mmp',
      password: 'Asdasd*123'
    })

    anotherUser = data.body.userId as string
    const res = await api.post(`/api/follower/follow/${anotherUser}`).set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      createdAt: expect.any(String),
      followerId: userId,
      followedId: anotherUser,
      id: expect.any(String)
    })
  })
})

describe('POST /api/follower/unfollow/:user_id', () => {
  test('should return 404 NOT FOUND when user does not exist', async () => {
    const res = await api.post('/api/follower/unfollow/80f29385-cab9-47d5-997c-0fb8362b8030').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      code: 404,
      message: "Not found. Couldn't find follow"
    })
  })

  test('should return 200 OK', async () => {
    const res = await api.post(`/api/follower/unfollow/${anotherUser}`).set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      message: 'Unfollowed'
    })
  })
})
