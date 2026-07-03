import { formatInTimeZone } from "date-fns-tz";

export function getUserLocalDate(timezone: string, date: Date = new Date()): Date {
  const dateStr = formatInTimeZone(date, timezone, "yyyy-MM-dd");
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export function getYesterdayLocalDate(timezone: string, date: Date = new Date()): Date {
  const local = getUserLocalDate(timezone, date);
  local.setUTCDate(local.getUTCDate() - 1);
  return local;
}

export function isSameLocalDate(a: Date | null | undefined, b: Date): boolean {
  if (!a) return false;
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

export function isConsecutiveDay(
  lastDate: Date | null | undefined,
  currentDate: Date
): boolean {
  if (!lastDate) return false;
  const yesterday = new Date(currentDate);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return isSameLocalDate(lastDate, yesterday);
}
