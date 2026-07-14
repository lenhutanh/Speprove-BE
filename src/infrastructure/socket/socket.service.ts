import { Server } from 'socket.io'
import { singleton } from 'tsyringe'
import { socketAuthMiddleware } from '~/common/middlewares/socket.middleware'

@singleton()
export class SocketService {
  private io: Server | null = null

  public init(server: any, corsOptions: any): Server {
    this.io = new Server(server, {
      cors: corsOptions
    })
    this.io.use(socketAuthMiddleware)

    return this.io
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

  public toRoom(room: string, event: string, data: any) {
    if (!this.io) return
    this.io.to(room).emit(event, data)
  }

  public joinUserToRoom(userId: string, room: string) {
    if (!this.io) return
    this.io.in(`user:${userId}`).socketsJoin(room)
  }
}
