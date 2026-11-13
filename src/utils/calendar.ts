import { CampusEvent } from '../types';

function formatIcsDateTime(dateISO: string, timeStr: string): string {
  const cleanDate = dateISO.replace(/-/g, '');
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return `${cleanDate}T120000`;
  }
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  const hh = String(hours).padStart(2, '0');
  return `${cleanDate}T${hh}${minutes}00`;
}

export function downloadEventsIcs(events: CampusEvent[], filename = 'campverse-schedule.ics'): void {
  if (events.length === 0) return;

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampVerse//Campus Discovery//EN',
    'CALSCALE:GREGORIAN',
  ];

  for (const evt of events) {
    const dtStart = formatIcsDateTime(evt.dateISO, evt.startTime);
    const dtEnd = formatIcsDateTime(evt.dateISO, evt.endTime);
    const escapedSummary = evt.title.replace(/[,;]/g, '\\$&');
    const escapedLocation = `${evt.buildingName}, ${evt.room}`.replace(/[,;]/g, '\\$&');
    const escapedDesc = `${evt.organizationName} — ${evt.summary}`.replace(/\r?\n/g, ' ').replace(/[,;]/g, '\\$&');

    lines.push(
      'BEGIN:VEVENT',
      `UID:${evt.id}@campverse.edu`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapedSummary}`,
      `LOCATION:${escapedLocation}`,
      `DESCRIPTION:${escapedDesc}`,
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
