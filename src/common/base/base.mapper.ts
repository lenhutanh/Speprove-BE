export abstract class BaseMapper<T, R> {
  abstract toResponse(entity: T): R

  toResponseList(entities: readonly T[]): R[] {
    return entities.map((e) => this.toResponse(e))
  }
}
