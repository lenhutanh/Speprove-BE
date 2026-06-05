import { TokenPayload } from '../common/types/token-payload.type'

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
