import { container } from 'tsyringe'
import { VOICE_ROOM_SOCKET_EVENTS } from '~/modules/voice-room/voice-room.constants'
import { SocketService } from './socket.service'

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
    console.log(`User ${userId} connected to socket`)

    socket.on(VOICE_ROOM_SOCKET_EVENTS.LOBBY_JOIN, () => {
      socket.join('lobby')
    })

    socket.on(VOICE_ROOM_SOCKET_EVENTS.LOBBY_LEAVE, () => {
      socket.leave('lobby')
    })

    socket.on(VOICE_ROOM_SOCKET_EVENTS.ROOM_JOIN, (roomId: string) => {
      if (roomId) {
        socket.join(`voice-room:${roomId}`)
      }
    })

    socket.on(VOICE_ROOM_SOCKET_EVENTS.ROOM_LEAVE, (roomId: string) => {
      if (roomId) {
        socket.leave(`voice-room:${roomId}`)
      }
    })
  })

  return io
}

export function closeSocket() {
  const socketService = container.resolve(SocketService)
  socketService.close()
}
