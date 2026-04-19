import { PopulateOptions as MongoosePopulateOptions, QueryFilter, Types } from 'mongoose'

type DeepPath<T> = T extends object
  ? {
      [K in keyof T & string]: NonNullable<T[K]> extends Date | Types.ObjectId
        ? K
        : NonNullable<T[K]> extends Array<infer U>
          ? U extends object
            ? K | `${K}.${DeepPath<NonNullable<U>>}`
            : K
          : NonNullable<T[K]> extends object
            ? `${K}` | `${K}.${DeepPath<NonNullable<T[K]>>}`
            : K
    }[keyof T & string]
  : string

export type FieldPath<T> = DeepPath<T> | (string & {})

type OperatorHandler = (field: string, value: any) => void

export class QueryBuilder<T> {
  private filters: any = {}
  private populateFields: (string | MongoosePopulateOptions)[] = []
  private selectFields: string = ''
  private sortFields: Record<string, 1 | -1> = {}
  private limitValue?: number

  // ==================== BASIC FILTERS ====================

  limit(value: number): this {
    this.limitValue = value
    return this
  }

  private setFilterOperator(field: FieldPath<T>, operator: string, value: any) {
    if (!this.filters[field] || typeof this.filters[field] !== 'object' || Array.isArray(this.filters[field])) {
      const existingValue = this.filters[field]
      this.filters[field] = {}
      if (existingValue !== undefined && existingValue !== null) {
        this.filters[field]['$eq'] = existingValue
      }
    }
    this.filters[field][operator] = value
  }

  private castValue(field: FieldPath<T>, val: any) {
    if (val === null || val === undefined) return val

    // ObjectId
    if (typeof val === 'string' && (field === '_id' || field.endsWith('Id') || field.endsWith('_id'))) {
      return Types.ObjectId.isValid(val) ? new Types.ObjectId(val) : val
    }

    // Boolean
    if (val === 'true') return true
    if (val === 'false') return false

    // Detect date field by name
    const isDateField = /(date|at)$/i.test(field)

    // Number (avoid casting date string)
    const isNumeric = typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))

    if (isNumeric && !isDateField) return Number(val)

    // Date
    if (typeof val === 'string' && !isNaN(Date.parse(val)) && isDateField) {
      return new Date(val)
    }

    return val
  }

  applyFilters(filters: Record<string, any>, allowedFields?: string[]): this {
    const handlers: Record<string, OperatorHandler> = {
      _gte: (f, v) => this.whereGte(f, v),
      _lte: (f, v) => this.whereLte(f, v),
      _gt: (f, v) => this.whereGt(f, v),
      _lt: (f, v) => this.whereLt(f, v),
      _ne: (f, v) => this.whereNot(f, v),
      _in: (f, v) => this.whereIn(f, Array.isArray(v) ? v : [v]),
      _nin: (f, v) => this.whereNotIn(f, Array.isArray(v) ? v : [v]),
      _exists: (f, v) => this.whereExists(f, v === 'true' || v === true)
    }

    const suffixKeys = Object.keys(handlers)

    Object.entries(filters).forEach(([key, rawValue]) => {
      // skip empty
      if (
        rawValue === undefined ||
        rawValue === null ||
        rawValue === '' ||
        (Array.isArray(rawValue) && rawValue.length === 0)
      )
        return

      // detect operator suffix
      const suffix = suffixKeys.find((s) => key.endsWith(s))
      const baseField = suffix ? key.slice(0, -suffix.length) : key

      // whitelist protection
      if (allowedFields && !allowedFields.includes(baseField)) return

      // cast value
      const finalValue = Array.isArray(rawValue)
        ? rawValue.map((v) => this.castValue(baseField, v))
        : this.castValue(baseField, rawValue)

      // dispatch
      if (suffix) {
        handlers[suffix](baseField, finalValue)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        Array.isArray(finalValue) ? this.whereIn(baseField, finalValue) : this.where(baseField, finalValue)
      }
    })

    return this
  }

  where(field: FieldPath<T>, value: any): this {
    this.setFilterOperator(field, '$eq', this.castValue(field, value))
    return this
  }

  whereNot(field: FieldPath<T>, value: any): this {
    this.setFilterOperator(field, '$ne', value)
    return this
  }

  whereIn(field: FieldPath<T>, values: any[]): this {
    this.setFilterOperator(field, '$in', values)
    return this
  }

  whereNotIn(field: FieldPath<T>, values: any[]): this {
    this.setFilterOperator(field, '$nin', values)
    return this
  }

  // ==================== COMPARISON OPERATORS ====================

  whereGt(field: FieldPath<T>, value: any): this {
    this.setFilterOperator(field, '$gt', value)
    return this
  }

  whereGte(field: FieldPath<T>, value: any): this {
    this.setFilterOperator(field, '$gte', value)
    return this
  }

  whereLt(field: FieldPath<T>, value: any): this {
    this.setFilterOperator(field, '$lt', value)
    return this
  }

  whereLte(field: FieldPath<T>, value: any): this {
    this.setFilterOperator(field, '$lte', value)
    return this
  }

  whereBetween(field: FieldPath<T>, min: any, max: any): this {
    this.setFilterOperator(field, '$gte', min)
    this.setFilterOperator(field, '$lte', max)
    return this
  }

  // ==================== EXISTENCE ====================

  whereExists(field: FieldPath<T>, exists: boolean = true): this {
    this.setFilterOperator(field, '$exists', exists)
    return this
  }

  whereNull(field: FieldPath<T>): this {
    this.where(field, null) // $eq: null
    return this
  }

  whereNotNull(field: FieldPath<T>): this {
    this.setFilterOperator(field, '$ne', null)
    return this
  }

  // ==================== SEARCH & REGEX ====================

  private escapeRegex(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  whereRegex(field: FieldPath<T>, pattern: string, options?: string): this {
    const safePattern = this.escapeRegex(pattern)
    this.setFilterOperator(field, '$regex', safePattern)
    if (options) {
      this.setFilterOperator(field, '$options', options)
    }
    return this
  }

  whereLike(field: FieldPath<T>, pattern: string): this {
    return this.whereRegex(field, pattern, 'i')
  }

  search(fields: string[], term: string): this {
    if (!term?.trim()) return this
    const safeTerm = this.escapeRegex(term.trim())

    const searchConditions = fields.map((field) => ({
      [field]: { $regex: safeTerm, $options: 'i' }
    }))

    if (this.filters.$or) {
      this.filters = {
        $and: [{ ...this.filters }, { $or: searchConditions }]
      }
      delete this.filters.$or
    } else {
      this.filters.$or = searchConditions
    }

    return this
  }

  // ==================== LOGICAL OPERATORS ====================

  or(conditions: Array<Record<string, any>>): this {
    this.filters.$or = conditions
    return this
  }

  and(conditions: Array<Record<string, any>>): this {
    this.filters.$and = conditions
    return this
  }

  // ==================== QUERY OPTIONS ====================

  populate(field: FieldPath<T> | MongoosePopulateOptions): this {
    this.populateFields.push(field)
    return this
  }

  select(fields: string): this {
    this.selectFields = fields
    return this
  }

  sort(field: FieldPath<T>, order: 'asc' | 'desc' = 'asc'): this {
    if (!field?.trim()) return this
    this.sortFields[field] = order === 'asc' ? 1 : -1
    return this
  }

  orderBy(field: FieldPath<T>, order: 'asc' | 'desc' = 'asc'): this {
    return this.sort(field, order)
  }

  // ==================== BUILD ====================

  getFilter(): QueryFilter<T> {
    return this.filters as QueryFilter<T>
  }

  getOptions() {
    const options: any = {}

    if (this.populateFields.length > 0) {
      options.populate = this.populateFields.length === 1 ? this.populateFields[0] : this.populateFields
    }

    if (this.selectFields) {
      options.select = this.selectFields
    }

    if (Object.keys(this.sortFields).length > 0) {
      options.sort = this.sortFields
    }

    if (this.limitValue !== undefined) options.limit = this.limitValue

    return options
  }

  build() {
    return {
      filter: this.getFilter(),
      options: this.getOptions()
    }
  }

  // ==================== RESET ====================

  reset(): this {
    this.filters = {}
    this.populateFields = []
    this.selectFields = ''
    this.sortFields = {}
    return this
  }
}
