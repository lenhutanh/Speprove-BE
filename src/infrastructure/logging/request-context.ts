import { AsyncLocalStorage } from 'node:async_hooks'

interface RequestContext {
  requestId: string
}

const storage = new AsyncLocalStorage<RequestContext>()

export const runWithRequestId = <T>(requestId: string, fn: () => T): T => storage.run({ requestId }, fn)

export const getRequestId = (): string | undefined => storage.getStore()?.requestId
