import swaggerJSDoc from 'swagger-jsdoc'
import { env } from './env.config'

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API Documentation',
      termsOfService: '',
      license: {
        name: 'Apache 2.0',
        url: 'https://www.apache.org/licenses/LICENSE-2.0'
      },
      contact: {
        name: env.AUTHOR
      }
    },
    servers: [
      {
        url: `http://${env.APP_HOST}:${env.APP_PORT}/v1`,
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/v1/*.ts', './src/controllers/*.ts']
}

export const swaggerSpec = swaggerJSDoc(options)
