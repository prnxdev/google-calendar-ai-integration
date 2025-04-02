export interface CalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
}

export interface ParsedEvent {
  title: string;
  startTime: string;
  endTime: string;
  date: string;
}
