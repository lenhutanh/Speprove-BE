import { IBaseRepository } from '~/common/base/base.repository.interface'
import { SessionType } from '../session.model'
import { Types } from 'mongoose'

export interface ISessionRepository extends IBaseRepository<SessionType> {
  upsertByUserId(userId: string | Types.ObjectId, data: Partial<SessionType>): Promise<SessionType | null>
  findValidSession(userId: string | Types.ObjectId, hashedToken: string): Promise<SessionType | null>
  findOneByUserId(userId: string | Types.ObjectId): Promise<SessionType | null>
  deleteByUserId(userId: string | Types.ObjectId): Promise<any>
}
