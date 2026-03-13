import { BaseRepository } from '~/common/base/base.repository'
import { Session, SessionType } from '../session.model'
import { ISessionRepository } from './session.repository.interface'
import { Types } from 'mongoose'

export class SessionRepository extends BaseRepository<SessionType> implements ISessionRepository {
  constructor() {
    super(Session)
  }
  public async upsertByUserId(
    userId: string | Types.ObjectId,
    data: Partial<SessionType>
  ): Promise<SessionType | null> {
    return await this.model
      .findOneAndUpdate(
        { userId },
        { $set: data },
        {
          upsert: true,
          new: true,
          lean: true
        }
      )
      .exec()
  }

  public async findValidSession(userId: string | Types.ObjectId, hashedToken: string): Promise<SessionType | null> {
    return await this.findOne({
      userId,
      token: hashedToken,
      expiresAt: { $gt: new Date() }
    })
  }

  public async findOneByUserId(userId: string | Types.ObjectId): Promise<SessionType | null> {
    return await this.findOne({ userId })
  }

  public async deleteByUserId(userId: string | Types.ObjectId): Promise<any> {
    return await this.model.deleteOne({ userId }).exec()
  }
}
