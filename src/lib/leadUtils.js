/**
 * Lead Utility Functions for Deterministic, Stable Chronological Ordering & Sanitization
 */

export function cleanLeadHospital(hosp) {
  if (!hosp || typeof hosp !== 'string') return 'NA';
  const trimmed = hosp.trim();
  const lower = trimmed.toLowerCase();
  if (
    !trimmed ||
    trimmed === 'NA' ||
    trimmed === 'N/A' ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    lower.includes('healthcare institution') ||
    lower.includes('health institute') ||
    lower.includes('healthcare facility') ||
    lower.includes('healthcare center') ||
    lower.includes('customer hospital') ||
    lower === 'hospital / healthcare center' ||
    lower === 'hospital / healthcare institution' ||
    lower === 'hospital' ||
    lower === 'general hospital' ||
    lower === 'clinic / hospital'
  ) {
    return 'NA';
  }
  return trimmed;
}

export function safeParseDate(str) {
  if (!str) return 0;
  
  // 1. Try standard Date parsing (e.g. ISO strings)
  const d = new Date(str);
  const time = d.getTime();
  if (!isNaN(time) && time > 0) return time;

  // 2. Fallback parser for human dates: "05 Nov 2026, 12:42 pm" or "05 Nov 2026 12:42 pm"
  const match = String(str).match(/(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap]m)?)?/i);
  if (match) {
    const [, day, month, year, hours, mins, secs, ampm] = match;
    const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
    const m = months[month.slice(0, 3).toLowerCase()];
    if (m !== undefined) {
      let h = hours ? parseInt(hours, 10) : 0;
      const min = mins ? parseInt(mins, 10) : 0;
      const s = secs ? parseInt(secs, 10) : 0;
      if (ampm) {
        if (ampm.toLowerCase() === 'pm' && h < 12) h += 12;
        if (ampm.toLowerCase() === 'am' && h === 12) h = 0;
      }
      const parsed = new Date(parseInt(year, 10), m, parseInt(day, 10), h, min, s).getTime();
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }

  return 0;
}

export function getLeadTimestamp(l) {
  if (!l) return 0;

  // Prioritize arrival dateTime (e.g. "05 Nov 2026, 12:42 pm")
  if (l.dateTime) {
    const t = safeParseDate(l.dateTime);
    if (t > 0) return t;
  }

  // Combined date and time fields
  if (l.date && l.time) {
    const t = safeParseDate(`${l.date} ${l.time}`);
    if (t > 0) return t;
  }

  // ISO createdAt
  if (l.createdAt) {
    const t = safeParseDate(l.createdAt);
    if (t > 0) return t;
  }

  // Raw lead data createdAt
  if (l.rawLeadData?.createdAt) {
    const t = safeParseDate(l.rawLeadData.createdAt);
    if (t > 0) return t;
  }

  // Timestamp field
  if (l.timestamp) {
    const t = typeof l.timestamp === 'number' ? l.timestamp : safeParseDate(l.timestamp);
    if (t > 0) return t;
  }

  // Fallback to updatedAt
  if (l.updatedAt) {
    const t = safeParseDate(l.updatedAt);
    if (t > 0) return t;
  }

  return 0;
}

/**
 * 100% Deterministic and Mathematically Stable Lead Sort Comparator.
 * Orders newest leads first. If timestamps are identical, uses ID as a rock-solid tie-breaker.
 */
export function stableLeadSort(a, b) {
  const timeA = getLeadTimestamp(a);
  const timeB = getLeadTimestamp(b);
  if (timeB !== timeA) {
    return timeB - timeA;
  }
  const idA = String(a?.id || a?._id || '');
  const idB = String(b?.id || b?._id || '');
  return idB.localeCompare(idA);
}

