/**
 * Formatting utilities for Ride Tracker mobility platform.
 */

/**
 * Formats duration in minutes into a clean, human-friendly string.
 * Examples:
 * - 15 -> "15 mins"
 * - 60 -> "1 hr"
 * - 90 -> "1 hr 30 mins"
 * - 135 -> "2 hrs 15 mins"
 * - 2702 -> "45 hrs 2 mins" (or "1 day 21 hrs 2 mins")
 * 
 * @param {number|string} minutes 
 * @param {object} [options]
 * @param {boolean} [options.includeDays=true] Whether to break down into days if >= 24h
 * @param {boolean} [options.compact=false] Whether to use compact style (e.g. 1h 30m)
 * @returns {string}
 */
export function formatDuration(minutes, options = {}) {
  if (minutes == null || isNaN(minutes)) return '0 mins';
  const totalMins = Math.max(1, Math.round(Number(minutes)));
  const { includeDays = true, compact = false } = options;

  if (totalMins < 60) {
    if (compact) return `${totalMins}m`;
    return `${totalMins} min${totalMins === 1 ? '' : 's'}`;
  }

  const days = Math.floor(totalMins / 1440);
  const hours = includeDays ? Math.floor((totalMins % 1440) / 60) : Math.floor(totalMins / 60);
  const remainingMins = totalMins % 60;

  if (compact) {
    if (includeDays && days > 0) {
      return `${days}d ${hours}h${remainingMins > 0 ? ` ${remainingMins}m` : ''}`.trim();
    }
    return `${hours}h${remainingMins > 0 ? ` ${remainingMins}m` : ''}`.trim();
  }

  // Multi-day duration
  if (includeDays && days > 0) {
    let result = `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) {
      result += ` ${hours} hr${hours > 1 ? 's' : ''}`;
    }
    if (remainingMins > 0 && days < 2) {
      result += ` ${remainingMins} min${remainingMins > 1 ? 's' : ''}`;
    }
    return result;
  }

  // Hours + Mins
  const hrStr = `${hours} hr${hours > 1 ? 's' : ''}`;
  if (remainingMins === 0) return hrStr;
  return `${hrStr} ${remainingMins} min${remainingMins > 1 ? 's' : ''}`;
}

/**
 * Formats distance with unit.
 * @param {number|string} km
 * @returns {string}
 */
export function formatDistance(km) {
  if (km == null || isNaN(km)) return '0 km';
  const num = Number(km);
  return num >= 10 ? `${Math.round(num)} km` : `${num.toFixed(1)} km`;
}

/**
 * Formats upfront fare with currency symbol.
 * @param {number|object} fare
 * @returns {string}
 */
export function formatFare(fare) {
  if (!fare) return '₹0';
  if (typeof fare === 'object') {
    const val = fare.total ?? fare.base ?? 0;
    return `₹${Math.round(val)}`;
  }
  return `₹${Math.round(Number(fare))}`;
}
