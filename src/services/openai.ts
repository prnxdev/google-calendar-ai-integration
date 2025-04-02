import OpenAI from 'openai';
import { ParsedEvent } from '../types';

export class OpenAIService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  private getNextDayOfWeek(dayName: string): string {
    const days = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
    const today = new Date();
    const todayDayNum = today.getDay();
    const targetDayNum = days.indexOf(dayName.toLowerCase());
    
    if (targetDayNum === -1) return today.toISOString().split('T')[0];
    
    let daysToAdd = targetDayNum - todayDayNum;
    if (daysToAdd <= 0) daysToAdd += 7;
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);
    return targetDate.toISOString().split('T')[0];
  }

  async parsePrompt(prompt: string): Promise<ParsedEvent> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Jesteś asystentem, który przetwarza naturalne polecenia w języku polskim na strukturyzowane dane wydarzenia.
            Odpowiadaj zawsze w formacie JSON z następującymi polami:
            {
              "title": "tytuł wydarzenia (co to za aktywność)",
              "startTime": "godzina rozpoczęcia w formacie HH:mm",
              "endTime": "godzina zakończenia w formacie HH:mm",
              "date": "dzień tygodnia po polsku (np. sobota, wtorek) lub data w formacie YYYY-MM-DD"
            }
            
            Przykład 1: "Jutro mam spotkanie o 15:00 na godzinę"
            {
              "title": "Spotkanie",
              "startTime": "15:00",
              "endTime": "16:00",
              "date": "YYYY-MM-DD" // jutrzejsza data
            }
            
            Przykład 2: "W sobotę idę na kręgle od 12 na 2 godziny"
            {
              "title": "Gra w kręgle",
              "startTime": "12:00",
              "endTime": "14:00",
              "date": "sobota"
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
      const parsedResponse = JSON.parse(jsonResponse);

      // Convert relative date to actual date
      if (parsedResponse.date) {
        if (parsedResponse.date.toLowerCase() === 'jutro') {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          parsedResponse.date = tomorrow.toISOString().split('T')[0];
        } else if (parsedResponse.date.toLowerCase() === 'dzisiaj') {
          parsedResponse.date = new Date().toISOString().split('T')[0];
        } else if (!parsedResponse.date.includes('-')) {
          // If it's a day name, convert it to actual date
          parsedResponse.date = this.getNextDayOfWeek(parsedResponse.date);
        }
      }

      return parsedResponse as ParsedEvent;
    } catch (error) {
      console.error('Błąd parsowania odpowiedzi:', error);
      throw new Error('Nie udało się przetworzyć promptu na dane wydarzenia');
    }
  }
}
