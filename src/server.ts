import express from 'express'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { Constants, NodeEnv, Logger } from '@utils'
import { router } from './router'
import { ErrorHandling } from '@utils/errors'
import { createServer } from 'node:http'
import { specs } from '@utils/swagger'

export const app = express()
export const server = createServer(app)

// eslint-disable-next-line import/first
import './socket'

if (Constants.NODE_ENV === NodeEnv.DEV) {
  app.use(morgan('tiny'))
}

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(
  cors({
    origin: Constants.CORS_WHITELIST
  })
)

app.use('/api', router)
app.use(ErrorHandling)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs))

server.listen(Constants.PORT, () => {
  Logger.info(`Server listening on port ${Constants.PORT}`)
})
