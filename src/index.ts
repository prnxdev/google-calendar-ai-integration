import readlineSync from 'readline-sync';
import dotenv from 'dotenv';
import { OpenAIService } from './services/openai';
import { GoogleCalendarService } from './services/google-calendar';

// Load environment variables
dotenv.config();

// Initialize services
const openai = new OpenAIService(process.env.OPENAI_API_KEY!);
const calendar = new GoogleCalendarService(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_REDIRECT_URI!
);

async function main() {
  try {
    // Authorize with Google Calendar
    console.log('First, let\'s authorize with Google Calendar...');
    await calendar.authorize();

    while (true) {
      // Get user input
      const prompt = readlineSync.question('\nWpisz wydarzenie (lub "wyjdź" aby zakończyć): ');
      
      if (prompt.toLowerCase() === 'wyjdź') {
        break;
      }

      // Parse the prompt using OpenAI
      console.log('Analizuję prompt...');
      const parsedEvent = await openai.parsePrompt(prompt);

      // Confirm with user
      console.log('\nWykryte wydarzenie:');
      console.log(`Tytuł: ${parsedEvent.title}`);
      console.log(`Data: ${parsedEvent.date}`);
      console.log(`Od: ${parsedEvent.startTime}`);
      console.log(`Do: ${parsedEvent.endTime}`);

      const confirm = readlineSync.question('\nCzy chcesz dodać to wydarzenie do kalendarza? (tak/nie): ');

      if (confirm.toLowerCase() === 'tak') {
        // Add event to calendar
        await calendar.addEvent(parsedEvent);
        console.log('Wydarzenie zostało dodane do kalendarza!');
      } else {
        console.log('Anulowano dodawanie wydarzenia.');
      }
    }
  } catch (error) {
    console.error('Wystąpił błąd:', error);
  }
}

main();
