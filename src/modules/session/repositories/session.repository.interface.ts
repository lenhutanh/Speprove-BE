import { IBaseRepository } from '~/common/base/base.repository.interface'
import { SessionType } from '../session.model'
import { Types } from 'mongoose'

export interface ISessionRepository extends IBaseRepository<SessionType> {
  upsertByUserId(userId: string | Types.ObjectId, data: Partial<SessionType>): Promise<SessionType | null>
  rotateRefreshToken(
    userId: string | Types.ObjectId,
    currentHashedToken: string,
    data: Partial<SessionType>,
    sessionIdentifier?: { sid?: string; refreshTokenId?: string }
  ): Promise<SessionType | null>
  findOneByUserId(userId: string | Types.ObjectId): Promise<SessionType | null>
  findOneByUserIdAndSid(userId: string | Types.ObjectId, sid: string): Promise<SessionType | null>
  revokeByUserId(userId: string | Types.ObjectId, reason?: string): Promise<unknown>
  revokeByUserIdAndSid(userId: string | Types.ObjectId, sid: string, reason?: string): Promise<unknown>
}
