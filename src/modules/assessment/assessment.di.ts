import { container } from 'tsyringe'
import { TOKENS } from '~/core/di/di.constants'
import { GroqLLMProvider } from './adapters/llm/groq-llm.provider'
import { GroqSTTProvider } from './adapters/stt/groq-stt.provider'

export const registerAssessmentModule = () => {
  container.registerSingleton(TOKENS.ISTTProvider, GroqSTTProvider)
  container.registerSingleton(TOKENS.ILLMProvider, GroqLLMProvider)
}
