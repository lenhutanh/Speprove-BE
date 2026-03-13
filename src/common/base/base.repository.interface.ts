import { Types, UpdateQuery, PopulateOptions, ClientSession, QueryFilter } from 'mongoose'

export interface QueryOptions {
  populate?: string | string[] | PopulateOptions | PopulateOptions[]
  select?: string | string[] | Record<string, number>
  sort?: string | Record<string, 1 | -1>
  limit?: number
  skip?: number
  session?: ClientSession
  lean?: boolean
  includeSoftDeleted?: boolean
  upsert?: boolean
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface IBaseRepository<T> {
  findById(id: string | Types.ObjectId, options?: QueryOptions): Promise<T | null>
  findOne(filter: QueryFilter<T>, options?: QueryOptions): Promise<T | null>
  findMany(filter: QueryFilter<T>, options?: QueryOptions): Promise<T[]>
  paginate(filter: QueryFilter<T>, page: number, limit: number, options?: QueryOptions): Promise<PaginatedResult<T>>

  count(filter: QueryFilter<T>, options?: QueryOptions): Promise<number>
  exists(filter: QueryFilter<T>, options?: QueryOptions): Promise<boolean>

  create(data: Partial<T>, options?: QueryOptions): Promise<T>
  createMany(data: Partial<T>[], options?: QueryOptions): Promise<T[]>

  updateById(id: string | Types.ObjectId, update: UpdateQuery<T>, options?: QueryOptions): Promise<T | null>
  updateOne(filter: QueryFilter<T>, update: UpdateQuery<T>, options?: QueryOptions): Promise<T | null>
  updateMany(filter: QueryFilter<T>, update: UpdateQuery<T>, options?: QueryOptions): Promise<number>

  softDeleteById(id: string | Types.ObjectId, options?: QueryOptions): Promise<boolean>
  restoreById(id: string | Types.ObjectId, options?: QueryOptions): Promise<boolean>

  hardDeleteById(id: string | Types.ObjectId, options?: QueryOptions): Promise<boolean>
  hardDeleteMany(filter: QueryFilter<T>, options?: QueryOptions): Promise<number>

  withTransaction<R>(callback: (session: ClientSession) => Promise<R>): Promise<R>
  bulkWrite(operations: any[], options?: QueryOptions): Promise<any>
}
