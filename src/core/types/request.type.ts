import { Request } from 'express'
import { TokenPayload } from '../security/token-payload.type'

export interface AuthenticatedRequest extends Request {
  user: TokenPayload
}
