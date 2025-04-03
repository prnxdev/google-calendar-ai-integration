import { google } from 'googleapis';
import { CalendarEvent, ParsedEvent } from '../types';

export class GoogleCalendarService {
  private oauth2Client;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
  }

  async authorize(): Promise<void> {
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar'],
    });

    console.log('\nInstrukcja autoryzacji:');
    console.log('1. Otwórz poniższy URL w przeglądarce:');
    console.log(url);
    console.log('\n2. Zaloguj się i udziel uprawnień aplikacji');
    console.log('3. Po przekierowaniu, skopiuj kod z adresu URL (parametr "code=")');
    console.log('   Przykład: jeśli URL to http://localhost:3000/oauth2callback?code=4/ABC123...');
    console.log('   to skopiuj tylko część "4/ABC123..." (bez code= i innych parametrów)\n');
    
    const code = await new Promise<string>((resolve) => {
      const readlineSync = require('readline-sync');
      const authCode = readlineSync.question('Wklej kod autoryzacyjny: ');
      // Decode URL-encoded code
      const decodedCode = decodeURIComponent(authCode);
      resolve(decodedCode);
    });

    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      console.log('\nAutoryzacja zakończona sukcesem!');
    } catch (error: any) {
      if (error.response?.data?.error === 'invalid_grant') {
        console.error('\nBłąd autoryzacji:');
        console.error('- Upewnij się, że kod nie był już wcześniej użyty');
        console.error('- Kod autoryzacyjny jest ważny tylko przez krótki czas');
        console.error('- Spróbuj wygenerować nowy kod otwierając URL ponownie');
      }
      throw error;
    }
  }

  async addEvent(parsedEvent: ParsedEvent): Promise<void> {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const event: CalendarEvent = {
      summary: parsedEvent.title,
      start: {
        dateTime: `${parsedEvent.dates[0]}T${parsedEvent.startTime}:00`,
        timeZone: 'Europe/Warsaw',
      },
      end: {
        dateTime: `${parsedEvent.dates[0]}T${parsedEvent.endTime}:00`,
        timeZone: 'Europe/Warsaw',
      },
    };

    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });
      console.log('Event created:', response.data.htmlLink);
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }
}
