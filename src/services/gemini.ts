import { GoogleGenerativeAI } from '@google/generative-ai';
import { ParsedEvent, ParsedEventRange } from '../types';

export class GeminiService {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async parsePrompt(prompt: string): Promise<ParsedEvent> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const response = await model.generateContent(
      `Jesteś asystentem, który przetwarza naturalne polecenia w języku polskim na strukturyzowane dane wydarzenia.
          Dzisiejsza data to: ${today.toISOString().split('T')[0]}

          Odpowiadaj zawsze w formacie JSON z następującymi polami:
          {
            "title": "tytuł wydarzenia (co to za aktywność)",
            "startTime": "godzina rozpoczęcia w formacie HH:mm",
            "endTime": "godzina zakończenia w formacie HH:mm",
            "dates": [  // Lista dat w formacie YYYY-MM-DD
              "YYYY-MM-DD",  // Pierwsza data
              "YYYY-MM-DD",  // Druga data (opcjonalnie)
              ...            // Kolejne daty (opcjonalnie)
            ]
          }

          Zasady przetwarzania dat:
          - dla "dzisiaj" użyj: ${today.toISOString().split('T')[0]}
          - dla "jutro" użyj: ${tomorrow.toISOString().split('T')[0]}
          - dla dni tygodnia (np. "wtorek") znajdź najbliższą datę tego dnia
          - dla zakresu dat (np. "od poniedziałku do piątku") dodaj wszystkie daty w tym zakresie
          - dla konkretnych dni (np. "we wtorek, środę i piątek") dodaj tylko wymienione dni
          - jeśli nie podano daty, użyj dzisiejszej
          
          Przykłady:
          1. "Jutro mam spotkanie o 15:00 na godzinę"
          {
            "title": "Spotkanie",
            "startTime": "15:00",
            "endTime": "16:00",
            "dates": ["${tomorrow.toISOString().split('T')[0]}"]
          }
          
          2. "Od poniedziałku do piątku pracuję z biura 8-16"
          {
            "title": "Praca z biura",
            "startTime": "08:00",
            "endTime": "16:00",
            "dates": [
              "YYYY-MM-DD",  // poniedziałek
              "YYYY-MM-DD",  // wtorek
              "YYYY-MM-DD",  // środa
              "YYYY-MM-DD",  // czwartek
              "YYYY-MM-DD"   // piątek
            ]
          }

          3. "We wtorek, środę i piątek mam spotkania od 10 do 11"
          {
            "title": "Spotkanie",
            "startTime": "10:00",
            "endTime": "11:00",
            "dates": [
              "YYYY-MM-DD",  // wtorek
              "YYYY-MM-DD",  // środa
              "YYYY-MM-DD"   // piątek
            ]
          }

          Teraz przetwórz następujące polecenie: ${prompt}`
    );

    const result = response.response.text();
    try {
      // Usuń znaczniki markdown i wyczyść tekst
      const cleanJson = result
        .replace(/```json\n?/g, '') // usuń ```json
        .replace(/```\n?/g, '')     // usuń końcowe ```
        .trim();                    // usuń białe znaki
      
      const parsedResult = JSON.parse(cleanJson) as ParsedEventRange;
      
      if (!parsedResult.dates || parsedResult.dates.length === 0) {
        // Jeśli nie podano dat, użyj dzisiejszej
        parsedResult.dates = [today.toISOString().split('T')[0]];
      }

      return parsedResult as ParsedEvent;
    } catch (error) {
      console.error('Błąd parsowania odpowiedzi:', error);
      console.error('Otrzymana odpowiedź:', result);
      throw new Error('Nie udało się przetworzyć promptu na dane wydarzenia');
    }
  }
}
