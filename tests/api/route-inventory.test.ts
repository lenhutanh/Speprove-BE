import { beforeAll, describe, expect, it } from 'vitest'
import { createApp } from '~/app'
import { setupTestContainer } from '../helpers/test-container'

type Layer = {
  route?: { path: string; methods: Record<string, boolean> }
  rawPath?: string | RegExp | Array<string | RegExp>
  handle?: { stack?: Layer[] }
}

function joinPath(prefix: string, path: string): string {
  const joined = `${prefix}/${path}`.replace(/\/+/g, '/')
  return joined.length > 1 ? joined.replace(/\/$/, '') : joined
}

function collectRoutes(stack: Layer[], prefix: string, out: string[]): void {
  for (const layer of stack) {
    if (layer.route) {
      for (const method of Object.keys(layer.route.methods)) {
        out.push(`${method.toUpperCase()} ${joinPath(prefix, layer.route.path)}`)
      }
    } else if (layer.handle?.stack) {
      collectRoutes(layer.handle.stack, joinPath(prefix, String(layer.rawPath ?? '/')), out)
    }
  }
}

describe('route inventory', () => {
  let routes: string[]

  beforeAll(() => {
    setupTestContainer()
    const app = createApp()
    routes = []
    collectRoutes((app.router as unknown as { stack: Layer[] }).stack, '/', routes)
    routes.sort()
  })

  // Moving files must not add, remove or rename a route. Update the snapshot only when a route changes on purpose.
  it('registers the same method and path of every route', async () => {
    await expect(routes.join('\n') + '\n').toMatchFileSnapshot('./__snapshots__/route-inventory.txt')
  })

  it('has no duplicated route', () => {
    expect(new Set(routes).size).toBe(routes.length)
  })
})
