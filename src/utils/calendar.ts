import { InvitationData } from '../types/invitation';

export function getGoogleCalendarUrl(invitation: InvitationData): string {
  // Format target date
  const eventDate = new Date(invitation.targetDateTime);
  const startIso = eventDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
  
  // Default duration: 4 hours
  const endDate = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000);
  const endIso = endDate.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const title = encodeURIComponent(`${invitation.eventTitle} - ${invitation.primaryHosts}`);
  const details = encodeURIComponent(
    `${invitation.welcomeMessage}\n\nĐịa điểm: ${invitation.venueName} (${invitation.venueRoom || ''})\nĐịa chỉ: ${invitation.venueAddress}\nDress code: ${invitation.dressCodeTitle}\nLiên hệ: ${invitation.contactPhone}`
  );
  const location = encodeURIComponent(`${invitation.venueName}, ${invitation.venueAddress}`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
}

export function downloadIcsFile(invitation: InvitationData) {
  const eventDate = new Date(invitation.targetDateTime);
  const startIso = eventDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
  const endDate = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000);
  const endIso = endDate.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Interactive Invitation Studio//VI',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:${invitation.eventTitle} - ${invitation.primaryHosts}`,
    `DESCRIPTION:${invitation.welcomeMessage.replace(/\n/g, '\\n')}`,
    `LOCATION:${invitation.venueName}\\, ${invitation.venueAddress}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${invitation.eventType}-invitation.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
