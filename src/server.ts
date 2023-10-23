import express from 'express'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import swaggerJSDocs from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

import { Constants, NodeEnv, Logger } from '@utils'
import { router } from '@router'
import { ErrorHandling } from '@utils/errors'

const app = express()

// Set up request logger
if (Constants.NODE_ENV === NodeEnv.DEV) {
  app.use(morgan('tiny')) // Log requests only in development environments
}

// Set up request parsers
app.use(express.json()) // Parses application/json payloads request bodies
app.use(express.urlencoded({ extended: false })) // Parse application/x-www-form-urlencoded request bodies
app.use(cookieParser()) // Parse cookies

// Set up CORS
app.use(
  cors({
    origin: Constants.CORS_WHITELIST
  })
)

app.use('/api', router)

app.use(ErrorHandling)

app.listen(Constants.PORT, () => {
  Logger.info(`Server listening on port ${Constants.PORT}`)
})

const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Twitter Express API',
      version: '0.1.0',
      description:
        'Twitter API Documentation'
    },
    servers: [
      {
        url: 'http://localhost:8080'
      }
    ]
  },
  apis: [
    './src/router/index.ts',
    './src/domains/user/controller/*.ts',
    './src/domains/auth/controller/*.ts',
    './src/domains/post/controller/*.ts',
    './src/domains/health/controller/*.ts',
    './src/domains/follower/controller/*.ts',
    './src/domains/reaction/controller/*.ts'
  ]
}

const specs = swaggerJSDocs(options)
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(specs)
)
