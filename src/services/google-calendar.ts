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

    console.log('Please visit this URL to authorize the application:', url);
    
    // In a real application, you would handle the OAuth2 callback here
    // For now, we'll use a manual token input process
    const code = await new Promise<string>((resolve) => {
      const readlineSync = require('readline-sync');
      const authCode = readlineSync.question('Enter the authorization code: ');
      resolve(authCode);
    });

    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
  }

  async addEvent(parsedEvent: ParsedEvent): Promise<void> {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const event: CalendarEvent = {
      summary: parsedEvent.title,
      start: {
        dateTime: `${parsedEvent.date}T${parsedEvent.startTime}:00`,
        timeZone: 'Europe/Warsaw',
      },
      end: {
        dateTime: `${parsedEvent.date}T${parsedEvent.endTime}:00`,
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
