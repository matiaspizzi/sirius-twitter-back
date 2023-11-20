import supertest from 'supertest'
import { app, server } from '../../server'
import { db } from '../../utils/database'

const api = supertest(app)

beforeAll(async () => {
  await db.user.deleteMany()
})

afterAll(async () => {
  await db.$disconnect()
  server.close()
})

describe('POST /api/auth/signup', () => {
  test('should return 400 if missing fields', async () => {
    const response = await api.post('/api/auth/signup').send({})

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      errors: [
        {
          property: 'email',
          children: [],
          constraints: {
            isEmail: 'email must be an email',
            isNotEmpty: 'email should not be empty',
            isString: 'email must be a string'
          }
        },
        {
          property: 'username',
          children: [],
          constraints: {
            isNotEmpty: 'username should not be empty',
            isString: 'username must be a string'
          }
        },
        {
          property: 'password',
          children: [],
          constraints: {
            isStrongPassword: 'password is not strong enough',
            isNotEmpty: 'password should not be empty',
            isString: 'password must be a string'
          }
        }
      ],
      message: 'Validation Error',
      code: 400
    })
  })

  test('should return 400 if password is weak', async () => {
    const response = await api.post('/api/auth/signup').send({
      email: 'm@p.com',
      password: '123456',
      username: 'mp'
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      message: 'Validation Error',
      code: 400,
      errors: [
        {
          property: 'password',
          children: [],
          constraints: {
            isStrongPassword: 'password is not strong enough'
          }
        }
      ]
    })
  })

  test('should return 201 if user is created', async () => {
    const response = await api.post('/api/auth/signup').send({
      email: 'm@p.com',
      password: 'Asdasd*123',
      username: 'mp'
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      token: expect.any(String),
      userId: expect.any(String)
    })
  })

  test('should return 409 if user already exists', async () => {
    const response = await api.post('/api/auth/signup').send({
      email: 'm@p.com',
      password: 'Asdasd*123',
      username: 'mp'
    })

    expect(response.status).toBe(409)
    expect(response.body).toEqual({
      message: 'Conflict',
      code: 409,
      errors: {
        error_code: 'USER_ALREADY_EXISTS'
      }
    })
  })
})

describe('POST /api/auth/login', () => {
  test('should return 400 if missing fields', async () => {
    const response = await api.post('/api/auth/login').send({
      password: '',
      email: '',
      username: ''
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      message: 'Validation Error',
      code: 400,
      errors: [
        {
          property: 'email',
          children: [],
          constraints: {
            isNotEmpty: 'email should not be empty',
            isEmail: 'email must be an email'
          }
        },
        {
          property: 'username',
          children: [],
          constraints: {
            isNotEmpty: 'username should not be empty'
          }
        },
        {
          property: 'password',
          children: [],
          constraints: {
            isStrongPassword: 'password is not strong enough',
            isNotEmpty: 'password should not be empty'
          }
        }
      ]
    })
  })

  test('should return 404 if user does not exist', async () => {
    const response = await api.post('/api/auth/login').send({
      email: 'no@exists.com',
      password: 'Asdasd*123'
    })

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      message: "Not found. Couldn't find user",
      code: 404
    })
  })

  test('should return 400 if password is wrong', async () => {
    const response = await api.post('/api/auth/login').send({
      email: 'm@p.com',
      password: 'Asdas*123'
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      message: 'Validation Error',
      code: 400,
      errors: [
        {
          message: 'Invalid password'
        }
      ]
    })
  })

  test('should return 200 if user is loged in', async () => {
    const response = await api.post('/api/auth/login').send({
      email: 'm@p.com',
      password: 'Asdasd*123'
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      token: expect.any(String),
      userId: expect.any(String)
    })
  })
})
