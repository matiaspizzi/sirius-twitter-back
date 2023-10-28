import swaggerJSDocs from 'swagger-jsdoc'

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
        url: 'http://localhost:3030'
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
    './src/domains/reaction/controller/*.ts',
    './src/domains/comment/controller/*.ts'
  ]
}

export const specs = swaggerJSDocs(options)
