import { BaseRepository } from '~/common/base/base.repository'
import { Session, SessionType } from '../session.model'
import { ISessionRepository } from './session.repository.interface'
import { QueryFilter, Types } from 'mongoose'

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

  public async rotateRefreshToken(
    userId: string | Types.ObjectId,
    currentHashedToken: string,
    data: Partial<SessionType>,
    sessionIdentifier?: { sid?: string; refreshTokenId?: string }
  ): Promise<SessionType | null> {
    const filter: QueryFilter<SessionType> & { sid?: string; refreshTokenId?: string } = {
      userId,
      token: currentHashedToken,
      expiresAt: { $gt: new Date() },
      revokedAt: null
    }

    if (sessionIdentifier?.sid) {
      filter.sid = sessionIdentifier.sid
    }

    if (sessionIdentifier?.refreshTokenId) {
      filter.refreshTokenId = sessionIdentifier.refreshTokenId
    }

    return await this.model
      .findOneAndUpdate(
        filter,
        { $set: data },
        {
          new: true,
          lean: true
        }
      )
      .exec()
  }

  public async findOneByUserId(userId: string | Types.ObjectId): Promise<SessionType | null> {
    return await this.findOne({ userId })
  }

  public async findOneByUserIdAndSid(userId: string | Types.ObjectId, sid: string): Promise<SessionType | null> {
    return await this.findOne({ userId, sid })
  }

  public async revokeByUserId(userId: string | Types.ObjectId, reason?: string): Promise<unknown> {
    return await this.model
      .updateOne(
        { userId, revokedAt: null },
        {
          $set: {
            revokedAt: new Date(),
            revokedReason: reason
          }
        }
      )
      .exec()
  }

  public async revokeByUserIdAndSid(userId: string | Types.ObjectId, sid: string, reason?: string): Promise<unknown> {
    return await this.model
      .updateOne(
        { userId, sid, revokedAt: null },
        {
          $set: {
            revokedAt: new Date(),
            revokedReason: reason
          }
        }
      )
      .exec()
  }
}
