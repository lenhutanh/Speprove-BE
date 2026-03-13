import { Request } from 'express'
import { TokenPayload } from './token.interface'

export interface AuthenticatedRequest extends Request {
  user: TokenPayload
}
