import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import { Constants } from '@utils'
import { UnauthorizedException } from '@utils/errors'

export const generateAccessToken = (payload: Record<string, string | boolean | number>): string => {
  // Do not use this in production, the token will last 24 hours
  // For production apps, use a 15-minute token with a refresh token stored in a HttpOnly Cookie
  return jwt.sign(payload, Constants.TOKEN_SECRET, { expiresIn: '24h' })
}

export const withAuth = (req: Request, res: Response, next: () => any): void => {
  const [bearer, token] = req.headers.authorization?.split(' ') ?? []

  if (!bearer || !token || bearer !== 'Bearer') {
    res.status(401).send(new UnauthorizedException('MISSING_TOKEN'))
  }

  jwt.verify(token, Constants.TOKEN_SECRET, (err, context) => {
    if (err) res.status(401).send(new UnauthorizedException('INVALID_TOKEN'))
    res.locals.context = context
    next()
  })
}

export const encryptPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10)
}

export const checkPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}
