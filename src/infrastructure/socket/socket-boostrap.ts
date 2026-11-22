import { container } from 'tsyringe'
import { registerVoiceRoomSocket } from '~/modules/voice-room/voice-room.socket'
import { SocketService } from './socket.service'
import { logger } from '~/infrastructure/logging/logger'

export function initSocket(server: any, corsOptions: any) {
  const socketService = container.resolve(SocketService)

  const io = socketService.init(server, corsOptions)

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
