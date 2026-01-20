import { JwtPayload } from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      validated: {
        body?: any
        params?: any
        query?: any
      }
      jwtDecoded?: any | JwtPayload
    }
  }
}
