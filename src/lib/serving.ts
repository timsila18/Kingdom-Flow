export function upcomingDutyDates(
  date: string,
  recurrence: string,
  from = new Date(),
  count = 3,
): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const [year, month, day] = date.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, day));
  if (start.toISOString().slice(0, 10) !== date) return [];
  const fromDay = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const results: string[] = [];
  if (recurrence === "Once" || !["Weekly", "Monthly"].includes(recurrence))
    return start >= fromDay ? [date] : [];
  const firstStep = recurrence === "Weekly"
    ? Math.max(0, Math.floor((fromDay.getTime() - start.getTime()) / (7 * 86400000)))
    : Math.max(0, (fromDay.getUTCFullYear() - year) * 12 + fromDay.getUTCMonth() - (month - 1) - 1);
  for (let step = firstStep; step < firstStep + count + 2 && results.length < count; step++) {
    let occurrence: Date;
    if (recurrence === "Weekly") {
      occurrence = new Date(start.getTime() + step * 7 * 86400000);
    } else {
      const firstOfMonth = new Date(Date.UTC(year, month - 1 + step, 1));
      const lastDay = new Date(Date.UTC(firstOfMonth.getUTCFullYear(), firstOfMonth.getUTCMonth() + 1, 0)).getUTCDate();
      occurrence = new Date(Date.UTC(firstOfMonth.getUTCFullYear(), firstOfMonth.getUTCMonth(), Math.min(day, lastDay)));
    }
    if (occurrence >= fromDay)
      results.push(occurrence.toISOString().slice(0, 10));
  }
  return results;
}
