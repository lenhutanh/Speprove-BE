import { z } from 'zod'
import { updateSelectedVoiceSchema } from './account.validation'

export type UpdateSelectedVoiceBodyType = z.infer<typeof updateSelectedVoiceSchema>['body']
