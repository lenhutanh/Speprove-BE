import { TokenPayload } from '../core/security/token-payload.type'

declare global {
  namespace Express {
    interface Request {
      validated: {
        body?: any
        params?: any
        query?: any
      }
      user?: TokenPayload
    }
  }
}
