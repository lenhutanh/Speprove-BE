import Groq from 'groq-sdk'
import { ILLMProvider } from './llm.interface'
import { env } from '~/common/config'

export class GroqLLMProvider implements ILLMProvider {
  private readonly client: Groq
  private readonly model = 'openai/gpt-oss-120b'

  constructor() {
    this.client = new Groq({ apiKey: env.GROQ_API_KEY })
  }

  async complete(prompt: string): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.1,
      max_tokens: 2500,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }]
    })
    return completion.choices[0]?.message?.content ?? '{}'
  }
}
