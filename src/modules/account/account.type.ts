import { z } from 'zod'
import { updateProfileSchema } from '~/modules/account/account.validation'

export type UpdateProfileBodyType = z.infer<typeof updateProfileSchema>['body']
