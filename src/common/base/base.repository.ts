import { Model, ClientSession, Types, UpdateQuery, QueryFilter, PipelineStage } from 'mongoose'
import { IBaseRepository, PaginatedResult, QueryOptions } from './base.repository.interface'

export abstract class BaseRepository<T> implements IBaseRepository<T> {
  protected model: Model<T>

  // Config defaults
  private readonly DEFAULT_LEAN = true
  private readonly MAX_PAGE_LIMIT = 100
  private readonly BATCH_SIZE = 500
  private readonly HAS_SOFT_DELETE: boolean

  constructor(model: Model<T>) {
    this.model = model
    this.HAS_SOFT_DELETE = !!model.schema.path('deletedAt')
  }

  // ==================== FILTER & HELPERS ====================

  protected getFilter(filter: QueryFilter<T>, options?: QueryOptions): QueryFilter<T> {
    if (!this.HAS_SOFT_DELETE) return filter

    const finalFilter: QueryFilter<T> = { ...filter }

    if (!options?.includeSoftDeleted) {
      if ((finalFilter as any).deletedAt === undefined) {
        ;(finalFilter as any).deletedAt = null
      }
    }

    return finalFilter
  }

  protected applyOptions(query: any, options?: QueryOptions): any {
    if (!options) return this.DEFAULT_LEAN ? query.lean() : query

    if (options.session) query.session(options.session)
    if (options.populate) query.populate(options.populate)
    if (options.select) query.select(options.select)
    if (options.sort) query.sort(options.sort)

    if (options.skip) query.skip(options.skip)
    if (options.limit) query.limit(options.limit)

    // Lean logic
    if (options.lean ?? this.DEFAULT_LEAN) query.lean()

    return query
  }

  // ==================== READ ====================

  async findById(id: string | Types.ObjectId, options?: QueryOptions): Promise<T | null> {
    const filter = { _id: new Types.ObjectId(id) } as QueryFilter<T>
    return this.findOne(filter, options)
  }

  async findOne(filter: QueryFilter<T>, options?: QueryOptions): Promise<T | null> {
    const appliedFilter = this.getFilter(filter, options)
    let query = this.model.findOne(appliedFilter)
    query = this.applyOptions(query, options)
    return query.exec() as Promise<T | null>
  }

  async findMany(filter: QueryFilter<T>, options?: QueryOptions): Promise<T[]> {
    const appliedFilter = this.getFilter(filter, options)
    let query = this.model.find(appliedFilter)
    query = this.applyOptions(query, options)
    return query.exec() as Promise<T[]>
  }

  // ==================== PAGINATION ====================

  async paginate(
    filter: QueryFilter<T>,
    page: number = 1,
    limit: number = 10,
    options?: QueryOptions
  ): Promise<PaginatedResult<T>> {
    const safeLimit = Math.min(limit, this.MAX_PAGE_LIMIT)
    const safePage = Math.max(page, 1)
    const skip = (safePage - 1) * safeLimit
    const queryOptions = { ...options, skip, limit: safeLimit }

    const [data, total] = await Promise.all([this.findMany(filter, queryOptions), this.count(filter, options)])

    const totalPages = Math.max(1, Math.ceil(total / safeLimit))

    return {
      data,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
        hasNext: safePage < totalPages,
        hasPrev: safePage > 1
      }
    }
  }

  // ==================== UTILITY ====================

  async count(filter: QueryFilter<T>, options?: QueryOptions): Promise<number> {
    const appliedFilter = this.getFilter(filter, options)
    const query = this.model.countDocuments(appliedFilter)
    if (options?.session) query.session(options.session)
    return query.exec()
  }

  async exists(filter: QueryFilter<T>, options?: QueryOptions): Promise<boolean> {
    const appliedFilter = this.getFilter(filter, options)
    let query = this.model.exists(appliedFilter)
    if (options?.session) query = query.session(options.session)
    const result = await query
    return !!result
  }

  // ==================== WRITE ====================

  async create(data: Partial<T>, options?: QueryOptions): Promise<T> {
    const doc = new this.model(data as any)
    await doc.save({ session: options?.session || undefined })
    if (options?.populate) {
      await this.model.populate(doc, options.populate as any)
    }
    return (options?.lean ?? this.DEFAULT_LEAN) ? doc.toObject() : (doc as any)
  }

  async createMany(data: Partial<T>[], options?: QueryOptions): Promise<T[]> {
    const results: T[] = []
    const session = options?.session || undefined
    const shouldLean = options?.lean ?? this.DEFAULT_LEAN

    // Batch Insert Loop
    for (let i = 0; i < data.length; i += this.BATCH_SIZE) {
      const chunk = data.slice(i, i + this.BATCH_SIZE)

      const docs = await this.model.insertMany(chunk as any, { session })

      if (shouldLean) {
        docs.forEach((d) => results.push(d.toObject()))
      } else {
        docs.forEach((d) => results.push(d as unknown as T))
      }
    }

    return results
  }

  // ==================== UPDATE ====================

  async updateById(id: string | Types.ObjectId, update: UpdateQuery<T>, options?: QueryOptions): Promise<T | null> {
    const filter = { _id: new Types.ObjectId(id) } as QueryFilter<T>
    return this.updateOne(filter, update, options)
  }

  async updateOne(filter: QueryFilter<T>, update: UpdateQuery<T>, options?: QueryOptions): Promise<T | null> {
    const appliedFilter = this.getFilter(filter, options)
    let query = this.model.findOneAndUpdate(appliedFilter, update, {
      new: true,
      runValidators: true,
      context: 'query',
      upsert: options?.upsert ?? false
    })
    query = this.applyOptions(query, options)
    return query.exec() as Promise<T | null>
  }

  async updateMany(filter: QueryFilter<T>, update: UpdateQuery<T>, options?: QueryOptions): Promise<number> {
    const appliedFilter = this.getFilter(filter, options)
    const result = await this.model.updateMany(appliedFilter, update, {
      session: options?.session || undefined,
      runValidators: true
    })
    return result.modifiedCount
  }

  // ==================== SOFT DELETE ====================

  async softDeleteById(id: string | Types.ObjectId, options?: QueryOptions): Promise<boolean> {
    if (!this.HAS_SOFT_DELETE) {
      throw new Error('This model does not support soft delete (missing deletedAt field)')
    }
    const update = { deletedAt: new Date() } as UpdateQuery<T>
    const result = await this.updateById(id, update, options)
    return !!result
  }

  async restoreById(id: string | Types.ObjectId, options?: QueryOptions): Promise<boolean> {
    if (!this.HAS_SOFT_DELETE) {
      throw new Error('This model does not support soft delete')
    }
    const update = { $unset: { deletedAt: 1 } } as UpdateQuery<T>
    const restoreOptions = { ...options, includeSoftDeleted: true }
    const result = await this.updateById(id, update, restoreOptions)
    return !!result
  }

  // ==================== HARD DELETE ====================

  async hardDeleteById(id: string | Types.ObjectId, options?: QueryOptions): Promise<boolean> {
    let query = this.model.findByIdAndDelete(id)
    if (options?.session) query = query.session(options.session)
    const result = await query.exec()
    return !!result
  }

  async hardDeleteMany(filter: QueryFilter<T>, options?: QueryOptions): Promise<number> {
    const result = await this.model.deleteMany(filter, {
      session: options?.session || undefined
    })
    return result.deletedCount
  }

  // ==================== TRANSACTION ====================

  async withTransaction<R>(callback: (session: ClientSession) => Promise<R>): Promise<R> {
    const session = await this.model.db.startSession()
    try {
      return await session.withTransaction(() => callback(session))
    } finally {
      await session.endSession()
    }
  }

  async bulkWrite(operations: any[], options?: QueryOptions): Promise<any> {
    return this.model.bulkWrite(operations, { session: options?.session })
  }

  // ==================== AGGREGATE ====================

  protected async aggregate<R = any>(
    pipeline: PipelineStage[],
    options?: { session?: ClientSession; includeSoftDeleted?: boolean }
  ): Promise<R[]> {
    let finalPipeline = [...pipeline]

    // Apply soft delete filter automatically
    if (this.HAS_SOFT_DELETE && !options?.includeSoftDeleted) {
      finalPipeline = [{ $match: { deletedAt: null } }, ...finalPipeline]
    }

    const agg = this.model.aggregate<R>(finalPipeline).allowDiskUse(true)

    if (options?.session) {
      agg.session(options.session)
    }

    return agg.exec()
  }

  protected async aggregatePaginate<R = any>(
    pipeline: PipelineStage[],
    page: number = 1,
    limit: number = 10,
    options?: { session?: ClientSession; includeSoftDeleted?: boolean }
  ): Promise<PaginatedResult<R>> {
    const safeLimit = Math.min(limit, this.MAX_PAGE_LIMIT)
    const safePage = Math.max(page, 1)
    const skip = (safePage - 1) * safeLimit

    let finalPipeline = [...pipeline]

    // Apply soft delete filter automatically
    if (this.HAS_SOFT_DELETE && !options?.includeSoftDeleted) {
      finalPipeline = [{ $match: { deletedAt: null } }, ...finalPipeline]
    }

    const result = await this.aggregate<any>(
      [
        ...finalPipeline,
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: safeLimit }],
            metadata: [{ $count: 'total' }]
          }
        }
      ],
      options
    )

    const total = result?.[0]?.metadata?.[0]?.total ?? 0
    const data = result?.[0]?.data ?? []
    const totalPages = Math.max(1, Math.ceil(total / safeLimit))

    return {
      data,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
        hasNext: safePage < totalPages,
        hasPrev: safePage > 1
      }
    }
  }
}
