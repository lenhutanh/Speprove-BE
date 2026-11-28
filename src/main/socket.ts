import { container } from 'tsyringe'
import { socketAuthMiddleware } from '~/modules/auth/socket-auth.middleware'
import { registerVoiceRoomSocket } from '~/modules/voice-room/voice-room.socket'
import { SocketService } from '../core/realtime/socket.service'
import { logger } from '~/core/logging/logger'

export function initSocket(server: any, corsOptions: any) {
  const socketService = container.resolve(SocketService)

  const io = socketService.init(server, corsOptions)
  io.use(socketAuthMiddleware)

  io.on('connection', async (socket) => {
    const userId = socket.data.user?.id
    if (!userId) {
      socket.disconnect()
      return
    }

    socket.join(`user:${userId}`)
    logger.info(`User ${userId} connected to socket`)

    registerVoiceRoomSocket(socket, userId)
  })

  return io
}

export function closeSocket() {
  const socketService = container.resolve(SocketService)
  socketService.close()
}
