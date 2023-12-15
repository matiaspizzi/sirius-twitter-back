import { UserRepository } from '@domains/user/repository'
import {
  checkPassword,
  encryptPassword,
  generateAccessToken,
  NotFoundException,
  ValidationException
} from '@utils'
import jwt from 'jsonwebtoken'
import { LoginInputDTO, SignupInputDTO } from '../dto'
import { AuthService } from './auth.service'
import { Constants } from '@utils'

export class AuthServiceImpl implements AuthService {
  constructor (private readonly repository: UserRepository) {}

  async signup (data: SignupInputDTO): Promise<{ userId: string, token: string }> {
    const existingMail = await this.repository.getByEmail(data.email)
    if (existingMail) throw new ValidationException([{ message: 'Email already in use' }])
    const existingUsername = await this.repository.getByUsername(data.username)
    if (existingUsername) throw new ValidationException([{ message: 'Username already in use' }])

    const encryptedPassword = await encryptPassword(data.password)

    const user = await this.repository.create({ ...data, password: encryptedPassword })
    const token = generateAccessToken({ userId: user.id })

    return { userId: user.id, token }
  }

  async login (data: LoginInputDTO): Promise<{ userId: string, token: string }> {
    const user = await this.repository.getByEmailOrUsername(data.email, data.username)
    if (!user) throw new NotFoundException('user')

    const isCorrectPassword = await checkPassword(data.password, user.password)

    if (!isCorrectPassword) throw new ValidationException([{ message: 'password' }])

    const token = generateAccessToken({ userId: user.id })

    return { userId: user.id, token }
  }

  verifyToken (token: string): {isValid: boolean} {
    try {
      jwt.verify(token, Constants.TOKEN_SECRET)
      return { isValid: true }
    } catch (err) {
      return { isValid: false }
    }
  }
}
