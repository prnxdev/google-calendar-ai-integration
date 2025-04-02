import OpenAI from 'openai';
import { ParsedEvent } from '../types';

export class OpenAIService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async parsePrompt(prompt: string): Promise<ParsedEvent> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a calendar assistant that parses natural language prompts in Polish into structured event data.
            Extract the following information:
            - title (what kind of work/activity)
            - startTime (in HH:mm format)
            - endTime (in HH:mm format)
            - date (in YYYY-MM-DD format, use today's date if not specified)
            
            Respond only with valid JSON.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as ParsedEvent;
  }
}
