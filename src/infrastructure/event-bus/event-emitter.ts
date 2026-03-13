import { EventEmitter2 } from 'eventemitter2'
import { singleton } from 'tsyringe'

@singleton()
export class AppEventEmitter extends EventEmitter2 {
  constructor() {
    super({
      wildcard: true,
      delimiter: '.',
      maxListeners: 100,
      verboseMemoryLeak: true
    })
  }
}
