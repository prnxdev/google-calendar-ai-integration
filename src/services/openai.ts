import OpenAI from 'openai';
import { ParsedEvent } from '../types';

export class OpenAIService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async parsePrompt(prompt: string): Promise<ParsedEvent> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const response = await this.client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Jesteś asystentem, który przetwarza naturalne polecenia w języku polskim na strukturyzowane dane wydarzenia.
            Dzisiejsza data to: ${today.toISOString().split('T')[0]}

            Odpowiadaj zawsze w formacie JSON z następującymi polami:
            {
              "title": "tytuł wydarzenia (co to za aktywność)",
              "startTime": "godzina rozpoczęcia w formacie HH:mm",
              "endTime": "godzina zakończenia w formacie HH:mm",
              "date": "data w formacie YYYY-MM-DD"
            }

            Zasady przetwarzania dat:
            - dla "dzisiaj" użyj: ${today.toISOString().split('T')[0]}
            - dla "jutro" użyj: ${tomorrow.toISOString().split('T')[0]}
            - dla dni tygodnia (np. "sobota", "wtorek") znajdź najbliższą datę tego dnia
            - jeśli nie podano daty, użyj dzisiejszej
            
            Przykłady:
            1. "Jutro mam spotkanie o 15:00 na godzinę"
            {
              "title": "Spotkanie",
              "startTime": "15:00",
              "endTime": "16:00",
              "date": "${tomorrow.toISOString().split('T')[0]}"
            }
            
            2. "W sobotę idę na kręgle od 12 na 2 godziny"
            {
              "title": "Gra w kręgle",
              "startTime": "12:00",
              "endTime": "14:00",
              "date": "YYYY-MM-DD" // znajdź najbliższą sobotę
            }`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    try {
      const jsonResponse = response.choices[0].message.content || "{}";
      return JSON.parse(jsonResponse) as ParsedEvent;
    } catch (error) {
      console.error('Błąd parsowania odpowiedzi:', error);
      throw new Error('Nie udało się przetworzyć promptu na dane wydarzenia');
    }
  }
}
