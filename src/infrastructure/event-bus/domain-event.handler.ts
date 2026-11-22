import { logger } from '~/infrastructure/logging/logger'
export abstract class DomainEventHandler<T = any> {
  abstract readonly eventName: string

  abstract handle(payload: T): Promise<void>

  protected log(payload?: unknown): void {
    logger.debug(`[EventBus] ${this.constructor.name} catching: ${this.eventName}`, payload)
  }
}
