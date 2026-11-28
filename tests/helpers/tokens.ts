import jwt from 'jsonwebtoken'
import { env } from '~/config/env.config'
import { TOKEN_TYPE } from '~/core/security/token-payload.type'

export const accessTokenFor = (permissions: string[] = []) =>
  jwt.sign(
    { _id: '64b000000000000000000001', email: 'user@example.com', permissions, type: TOKEN_TYPE.ACCESS },
    env.ACCESS_TOKEN_SECRET_SIGNATURE,
    {
      expiresIn: '5m'
    }
  )
