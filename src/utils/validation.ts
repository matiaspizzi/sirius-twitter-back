import { validate } from 'class-validator'
import { NextFunction, Request, Response } from 'express'
import { ValidationException } from './errors'
import { plainToInstance } from 'class-transformer'
import { ClassType } from '@types'

export function BodyValidation<T> (target: ClassType<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    req.body = plainToInstance(target, req.body)
    const errors = await validate(req.body, {
      whitelist: true,
      forbidNonWhitelisted: true
    })

    if (errors.length > 0) { throw new ValidationException(errors.map(error => ({ ...error, target: undefined, value: undefined }))) }

    next()
  }
}

// a function that validates if the query param "type" is a valid ReactionType
export function ReactionTypeValidation (req: Request, res: Response, next: NextFunction) {
  const { type } = req.query
  if (type && !['LIKE', 'RETWEET'].includes(type as string)) {
    throw new ValidationException([{ message: 'Invalid reaction type, should be LIKE or RETWEET' }])
  }
  next()
}