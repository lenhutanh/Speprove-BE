import { Server } from 'socket.io'
import { singleton } from 'tsyringe'
import { socketAuthMiddleware } from '~/common/middlewares/socket.middleware'

@singleton()
export class SocketService {
  private io: Server | null = null

  public init(server: any, corsOptions: any) {
    this.io = new Server(server, {
      cors: corsOptions
    })
    this.io.use(socketAuthMiddleware)

    this.io.on('connection', (socket) => {
      const userId = socket.data.user?.id
      if (userId) {
        socket.join(`user:${userId}`)
        console.log(`User ${userId} connected to socket`)
      }
    })
  }

  public close() {
    if (this.io) {
      this.io.close()
    }
  }

  public emit(userId: string, event: string, data: any) {
    if (!this.io) return
    this.io.to(`user:${userId}`).emit(event, data)
  }
}
