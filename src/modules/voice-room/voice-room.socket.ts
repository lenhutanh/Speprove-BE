import { Socket } from 'socket.io'
import {
  getVoiceRoomSocketRoom,
  VOICE_ROOM_CHAT_CONFIG,
  VOICE_ROOM_SOCKET_EVENTS
} from './voice-room.constants'

export function registerVoiceRoomSocket(socket: Socket, userId: string) {
  socket.on(VOICE_ROOM_SOCKET_EVENTS.LOBBY_JOIN, () => {
    socket.join('lobby')
  })

  socket.on(VOICE_ROOM_SOCKET_EVENTS.LOBBY_LEAVE, () => {
    socket.leave('lobby')
  })

  socket.on(VOICE_ROOM_SOCKET_EVENTS.ROOM_JOIN, (roomId: string) => {
    if (roomId) {
      socket.join(getVoiceRoomSocketRoom(roomId))
    }
  })

  socket.on(VOICE_ROOM_SOCKET_EVENTS.ROOM_LEAVE, (roomId: string) => {
    if (roomId) {
      socket.leave(getVoiceRoomSocketRoom(roomId))
    }
  })

  socket.on(
    VOICE_ROOM_SOCKET_EVENTS.CHAT_SEND,
    (data: {
      roomId: string
      message?: {
        id?: string
        text?: string
        senderName?: string
        senderAvatar?: string | null
      }
    }) => {
      const text = data?.message?.text?.trim()
      if (!data?.roomId || !text || text.length > VOICE_ROOM_CHAT_CONFIG.MAX_MESSAGE_LENGTH) return

      const roomKey = getVoiceRoomSocketRoom(data.roomId)
      if (!socket.rooms.has(roomKey)) return

      const payload = {
        id: data.message?.id || `${Date.now()}`,
        senderId: userId,
        senderName: data.message?.senderName || 'User',
        senderAvatar: data.message?.senderAvatar || null,
        text,
        timestamp: Date.now()
      }

      socket.to(roomKey).emit(VOICE_ROOM_SOCKET_EVENTS.CHAT_MESSAGE, payload)
    }
  )
}

