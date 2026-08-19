function pad(n) {
  return String(n).padStart(2, '0');
}

function toICSDate(dateInput) {
  const d = new Date(dateInput);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

function addDays(dateInput, days) {
  const d = new Date(dateInput);
  d.setDate(d.getDate() + days);
  return d;
}

function escapeICS(text) {
  return String(text || '')
    .replace(/[\\;,]/g, (m) => '\\' + m)
    .replace(/\n/g, '\\n');
}

function buildEvent({ uid, dateStr, summary, description }) {
  const start = toICSDate(dateStr);
  const end = toICSDate(addDays(dateStr, 1));
  const stamp = toICSDate(new Date()) + 'T000000Z';
  return [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escapeICS(summary)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    'END:VEVENT',
  ].join('\r\n');
}

/**
 * Generates a .ics file (deadline + event date, when known) for a competition
 * and triggers a browser download — no backend endpoint needed for this.
 */
export function downloadICS(item) {
  const events = [
    buildEvent({
      uid: `deadline-${item.id}@campushub`,
      dateStr: item.registrationDeadline,
      summary: `Deadline Daftar: ${item.title}`,
      description: `Batas akhir pendaftaran "${item.title}" (${item.organizer}).`,
    }),
  ];

  if (item.eventDate) {
    events.push(
      buildEvent({
        uid: `event-${item.id}@campushub`,
        dateStr: item.eventDate,
        summary: `Hari-H: ${item.title}`,
        description: `Pelaksanaan "${item.title}" (${item.organizer}).`,
      })
    );
  }

  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CampusHub//Mading Lomba//ID', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'].join(
    '\r\n'
  );

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${item.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
