import { ExtendedError, Socket } from 'socket.io'
import { container } from 'tsyringe'
import { TOKENS } from '../constants/di.tokens'
import { ICacheService } from '~/infrastructure/cache'
import { buildRedisKey } from '~/infrastructure/redis/redis-key.util'
import { CACHE_CONFIG } from '~/modules/auth/auth.constants'

export const socketAuthMiddleware = async (socket: Socket, next: (err?: ExtendedError) => void) => {
  const ticket = socket.handshake.auth?.ticket

  if (!ticket) return next(new Error('Token not found'))

  try {
    const cacheService = container.resolve<ICacheService>(TOKENS.ICacheService)
    const redisKey = buildRedisKey(CACHE_CONFIG.SOCKET_TICKET, ticket)

    const userId = await cacheService.get(redisKey)

    if (!userId) return next(new Error('Ticket not found'))

    await cacheService.delete(redisKey)

    socket.data.user = { id: userId }

    next()
  } catch (error) {
    return next(new Error('Authentication failed'))
  }
}
