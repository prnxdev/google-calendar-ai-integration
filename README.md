# OpenAI Calendar Assistant

Aplikacja konsolowa, która używa OpenAI do interpretacji naturalnych poleceń w języku polskim i dodaje wydarzenia do Google Calendar.

## Wymagania

- Node.js
- pnpm
- Klucz API OpenAI
- Projekt w Google Cloud z włączonym Google Calendar API

## Konfiguracja

1. Sklonuj repozytorium
2. Zainstaluj zależności:
```bash
pnpm install
```

3. Skopiuj plik `.env.example` do `.env`:
```bash
cp .env.example .env
```

4. Uzupełnij plik `.env` swoimi danymi:
- `OPENAI_API_KEY` - klucz API z OpenAI
- `GOOGLE_CLIENT_ID` - ID klienta z Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - Secret klienta z Google Cloud Console
- `GOOGLE_REDIRECT_URI` - URI przekierowania (domyślnie http://localhost:3000/oauth2callback)

## Użycie

Uruchom aplikację:
```bash
pnpm start
```

Przykładowe polecenia:
- "Dzisiaj pracuję z domu od 8:00 do 16:00"
- "Jutro mam spotkanie z zespołem od 10:00 do 11:30"

## Rozwój

Dla programistów:
```bash
pnpm dev
```
