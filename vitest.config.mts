import { resolve } from 'node:path'
import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // SWC emits the decorator metadata that tsyringe constructor injection relies on
  plugins: [
    swc.vite({
      jsc: {
        target: 'es2022',
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true }
      }
    })
  ],
  resolve: { alias: { '~': resolve(import.meta.dirname, 'src') } },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/scripts/**', 'src/types/**', 'src/**/*.d.ts'],
      reporter: ['text-summary', 'json-summary', 'lcov'],
      reportsDirectory: 'coverage'
    },
    testTimeout: 30000,
    hookTimeout: 120000,
    env: {
      NODE_ENV: 'test',
      // Never read a developer's .env in tests: they must not reach real databases or services
      DOTENV_CONFIG_PATH: '/nonexistent',
      APP_NAME: 'speprove-test',
      APP_URL: 'http://localhost:3000',
      MONGODB_URI: 'mongodb://127.0.0.1:1/unused',
      DATABASE_NAME: 'speprove_test',
      ACCESS_TOKEN_SECRET_SIGNATURE: 'test-access-secret-test-access-secret-0123',
      REFRESH_TOKEN_SECRET_SIGNATURE: 'test-refresh-secret-test-refresh-secret-01',
      ACCESS_TOKEN_LIFE: '15m',
      REFRESH_TOKEN_LIFE: '7d',
      ACCESS_TOKEN_COOKIE_LIFE: '15m'
    }
  }
})
