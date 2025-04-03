import readlineSync from 'readline-sync';
import dotenv from 'dotenv';
import { GeminiService } from './services/gemini';
import { GoogleCalendarService } from './services/google-calendar';

// Load environment variables
dotenv.config();

// Initialize services
const gemini = new GeminiService(process.env.GOOGLE_AI_API_KEY!);
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

      // Parse the prompt using Gemini
      console.log('Przetwarzam prompt...');
      const event = await gemini.parsePrompt(prompt);

      // Show the parsed events
      console.log('\nRozpoznane wydarzenia:');
      console.log(`Tytuł: ${event.title}`);
      console.log(`Daty: ${event.dates.join(', ')}`);
      console.log(`Czas rozpoczęcia: ${event.startTime}`);
      console.log(`Czas zakończenia: ${event.endTime}`);

      // Ask for confirmation
      const confirm = readlineSync.question('\nCzy chcesz dodać te wydarzenia do kalendarza? (tak/nie): ');

      if (confirm.toLowerCase() === 'tak') {
        // Add each event separately
        for (const date of event.dates) {
          await calendar.addEvent({
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime,
            dates: [date]
          });
          console.log(`Dodano wydarzenie na ${date}`);
        }
        console.log('\nWszystkie wydarzenia zostały dodane do kalendarza!');
      } else {
        console.log('Anulowano dodawanie wydarzeń.');
      }
    }
  } catch (error) {
    console.error('Wystąpił błąd:', error);
  }
}

main();
