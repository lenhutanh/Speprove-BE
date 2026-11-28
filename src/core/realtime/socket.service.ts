import { Server } from 'socket.io'
import { singleton } from 'tsyringe'

@singleton()
export class SocketService {
  private io: Server | null = null

  public init(server: any, corsOptions: any): Server {
    this.io = new Server(server, {
      cors: corsOptions
    })

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
}
