import { container } from 'tsyringe'
import { SocketService } from './socket.service'
// import { ChatSocketHandler } from '~/modules/chat/handlers/chat-socket.handler'

export function initSocket(server: any, corsOptions: any) {
  const socketService = container.resolve(SocketService)
  // const chatSocketHandler = container.resolve(ChatSocketHandler)

  const io = socketService.init(server, corsOptions)

  io.on('connection', async (socket) => {
    const userId = socket.data.user?.id
    if (!userId) {
      socket.disconnect()
      return
    }

    socket.join(`user:${userId}`)
    console.log(`User ${userId} connected to socket`)

    // try {
    //   await chatSocketHandler.handleConnection(socket, userId)
    // } catch (err) {
    //   console.error('Error running chat socket handler:', err)
    // }
  })

  return io
}

export function closeSocket() {
  const socketService = container.resolve(SocketService)
  socketService.close()
}
