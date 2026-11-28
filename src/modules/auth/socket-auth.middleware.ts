import { ExtendedError, Socket } from 'socket.io'
import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { ICacheService } from '~/core/cache/cache.service.interface'
import { buildRedisKey } from '~/core/redis/redis-key.util'
import { CACHE_CONFIG } from './auth.constants'

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
