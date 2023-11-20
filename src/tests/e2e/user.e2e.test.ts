import supertest from 'supertest'
import { app, server } from '../../server'
import { db } from '../../utils/database'

const api = supertest(app)

let token = ''

beforeAll(async () => {
  await db.user.deleteMany()

  const data = await api.post('/api/auth/signup').send({
    email: 'm@p.com',
    username: 'mp',
    password: 'Asdasd*123'
  })

  token = data.body.token as string
})

afterAll(async () => {
  await db.$disconnect()
  server.close()
})

describe('GET /api/user/me', () => {
  test('should return 401 if missing token', async () => {
    const response = await api.get('/api/user/me')

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      code: 401,
      message: 'Unauthorized. You must login to access this content.',
      error: {
        error_code: 'MISSING_TOKEN'
      }
    })
  })

  test('should return 401 if invalid token', async () => {
    const response = await api.get('/api/user/me').set('Authorization', 'Bearer non-valid-token')

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      code: 401,
      error: {
        error_code: 'INVALID_TOKEN'
      }
    })
  })

  test('should return the loged user', async () => {
    const meResponse = await api.get('/api/user/me').set('Authorization', `Bearer ${token}`)
    expect(meResponse.status).toBe(200)
    expect(meResponse.body).toEqual({
      id: expect.any(String),
      username: 'mp',
      name: null,
      profilePicture: null
    })
  })
})

describe('GET /api/user/by_username/:username', () => {
  test('should return an empty array if users not found', async () => {
    const response = await api.get('/api/user/by_username/username').set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })

  test('should return 200 if user found', async () => {
    const response = await api.get('/api/user/by_username/mp').set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual([
      {
        id: expect.any(String),
        username: 'mp',
        name: null,
        profilePicture: null
      }
    ])
  })
})

describe('POST /api/user/private/:isPrivate', () => {
  test('should return 200 when changing privacy', async () => {
    const response = await api.post('/api/user/private/true').set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      private: true
    })

    const response2 = await api.post('/api/user/private/false').set('Authorization', `Bearer ${token}`)

    expect(response2.status).toBe(200)
    expect(response2.body).toEqual({
      private: false
    })
  })

  test('should return 400 if isPrivate is not a boolean', async () => {
    const response = await api.post('/api/user/private/123').set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      message: 'Validation Error',
      code: 400,
      errors: [
        {
          message: 'The parameter must be true or false'
        }
      ]
    })
  })
})

let profilePicUrl = ''
describe('GET /api/user/profilePicture/presignedUrl', () => {
  test('should return 200 if user is loged', async () => {
    const response = await api.get('/api/user/profilePicture/presignedUrl').set('Authorization', `Bearer ${token}`)
    profilePicUrl = response.body.profilePictureUrl

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      presignedUrl: expect.any(String),
      profilePictureUrl: expect.any(String)
    })
  })
})

describe('GET /api/user/profilePicture', () => {
  test('should return 200 if user is loged', async () => {
    const response = await api.get('/api/user/profilePicture').set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      profilePictureUrl: profilePicUrl
    })
  })
})

describe('DELETE /api/user', () => {
  test('should return 200 if user is loged', async () => {
    const response = await api.delete('/api/user/').set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
  })
})
