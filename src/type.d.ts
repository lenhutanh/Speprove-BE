import { TokenPayload } from './common/interfaces/token.interface'

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

// {
//   "watch": ["src", ".env"],
//   "ext": ".ts,.js,.json",
//   "ignore": [],
//   "exec": "tsx ./src/index.ts"
// }
