import { container, injectAll, singleton } from 'tsyringe'
import { IEventBus } from './event-bus.interface'
import { AppEventEmitter } from './event-emitter'
import { DomainEventName } from './event.types'
import { DomainEventHandler } from './domain-event.handler'
import { TOKENS } from '~/common/constants/di.tokens'

@singleton()
export class EventBus implements IEventBus {
  private registered = false

  constructor(private readonly emitter: AppEventEmitter) {}

  public registerHandlers(): void {
    if (this.registered) return

    const handlers: DomainEventHandler[] = container.isRegistered(TOKENS.DomainEventHandler)
      ? container.resolveAll<DomainEventHandler>(TOKENS.DomainEventHandler)
      : []

    handlers.forEach((handler) => {
      this.emitter.on(handler.eventName, async (payload) => {
        try {
          await handler.handle(payload)
        } catch (err) {
          console.error(`[EventBus] ${handler.constructor.name} failed:`, err)
        }
      })
      console.log(`[EventBus] Registered ${handler.constructor.name} -> ${handler.eventName}`)
    })

    this.registered = true
  }

  public publish(eventName: DomainEventName, payload: any): void {
    this.emitter.emit(eventName, payload)
  }
}
