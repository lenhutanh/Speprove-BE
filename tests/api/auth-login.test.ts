import request from 'supertest'
import { container } from 'tsyringe'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '~/main/app'
import { TOKENS } from '~/core/di/di.constants'
import { STATUS } from '~/core/persistence/status.constants'
import { IPasswordHasher } from '~/core/security/password-hasher.service.interface'
import { Account } from '~/modules/account/account.model'
import { GROUP_KIND } from '~/modules/account/group/group.constants'
import { Group } from '~/modules/account/group/group.model'
import { resetMongo, startMongo, stopMongo } from '../helpers/mongo'
import { setupTestContainer } from '../helpers/test-container'

const PASSWORD = 'Str0ng!Passw0rd'

describe('POST /api/v1/auth/login', () => {
  let app: ReturnType<typeof createApp>

  beforeAll(async () => {
    setupTestContainer()
    app = createApp()
    await startMongo()
  })
  afterAll(stopMongo)
  beforeEach(async () => {
    await resetMongo()
    const group = await Group.create({ name: 'user', kind: GROUP_KIND.USER, permissionIds: [] })
    const password = await container.resolve<IPasswordHasher>(TOKENS.IPasswordHasher).hash(PASSWORD)
    await Account.create({
      username: 'learner',
      email: 'learner@example.com',
      password,
      groupId: group._id,
      status: STATUS.ACTIVE
    })
  })

  it('signs a user in with the right password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'learner@example.com', password: PASSWORD })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(JSON.stringify(res.body)).not.toContain(PASSWORD)
  })

  it('answers 401 for a wrong password and for an unknown email, without telling which', async () => {
    const wrong = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'learner@example.com', password: 'wrong-pass-1' })
    const unknown = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: PASSWORD })

    expect(wrong.status).toBe(401)
    expect(unknown.status).toBe(401)
    expect(wrong.body.message).toBe(unknown.body.message)
  })

  it('answers 422 for an invalid body', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'not-an-email' })
    expect(res.status).toBe(422)
  })
})
