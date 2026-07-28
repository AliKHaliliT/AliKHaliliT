// Display helpers for "YYYY-MM" (or bare "YYYY") frontmatter dates.
//
// Parsed by string-splitting, NOT `new Date()`: Date parses "YYYY-MM" as UTC
// midnight, so `toLocaleDateString` renders the *previous* month for viewers
// west of UTC (e.g. "2024-01" → "Dec 2023" in Calgary).

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2024-01" → "Jan 2024"; "2024" → "2024". */
export function formatMonthYear(d: string): string {
  const [year, month] = d.split("-");
  if (!month) return year;
  return `${MONTHS[parseInt(month, 10) - 1]} ${year}`;
}

/** "Jan 2024 – Mar 2025", or "Jan 2024 – Present" without an end date. */
export function formatMonthYearRange(
  startDate?: string,
  endDate?: string
): string | null {
  if (!startDate) return null;
  const end = endDate ? formatMonthYear(endDate) : "Present";
  return `${formatMonthYear(startDate)} – ${end}`;
}

const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parts(d: string): { year: string; month?: number; day?: number } {
  const [year, month, day] = d.split("T")[0].split("-");
  return {
    year,
    month: month ? parseInt(month, 10) : undefined,
    day: day ? parseInt(day, 10) : undefined,
  };
}

/** "2024-03-05" → "Mar 5, 2024"; "2024-03" → "Mar 2024"; "2024" → "2024". */
export function formatShortDate(d: string): string {
  const { year, month, day } = parts(d);
  if (!month) return year;
  const my = `${MONTHS[month - 1]} ${year}`;
  return day ? `${MONTHS[month - 1]} ${day}, ${year}` : my;
}

/** "2024-03-05" → "March 5, 2024": the essay-header date. */
export function formatFullDate(d: string): string {
  const { year, month, day } = parts(d);
  if (!month) return year;
  return day
    ? `${MONTHS_LONG[month - 1]} ${day}, ${year}`
    : `${MONTHS_LONG[month - 1]} ${year}`;
}

/** "2024-03-05" → "Mar 05": the feed date rail. */
export function formatMonthDay(d: string): string {
  const { year, month, day } = parts(d);
  if (!month) return year;
  return day
    ? `${MONTHS[month - 1]} ${String(day).padStart(2, "0")}`
    : `${MONTHS[month - 1]} ${year}`;
}

/** "2024-03-05" → "March 2024": the feed month grouping key. */
export function formatMonthLong(d: string): string {
  const { year, month } = parts(d);
  if (!month) return year;
  return `${MONTHS_LONG[month - 1]} ${year}`;
}
