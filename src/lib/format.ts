/**
 * Formats an Open-Meteo local timestamp ("2026-06-10T10:30") as
 * "Aujourd'hui 10:30" when the date is today, "10/06/2026 10:30" otherwise.
 */
export function formatUpdatedAt(isoTime: string): string {
  const [date, time] = isoTime.split('T');
  if (!time) {
    return isoTime;
  }

  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');

  if (date === today) {
    return `Aujourd'hui ${time}`;
  }

  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year} ${time}`;
}

/** Extracts the "HH:MM" part of an Open-Meteo local timestamp. */
export function formatHour(isoTime: string): string {
  return isoTime.split('T')[1] ?? isoTime;
}

const COMPASS_POINTS = [
  'Nord',
  'Nord-Est',
  'Est',
  'Sud-Est',
  'Sud',
  'Sud-Ouest',
  'Ouest',
  'Nord-Ouest',
] as const;

/** Converts a wind direction in degrees to a French 8-point compass label. */
export function windDirectionLabel(degrees: number): string {
  const index = Math.round(degrees / 45) % COMPASS_POINTS.length;
  return COMPASS_POINTS[index];
}
