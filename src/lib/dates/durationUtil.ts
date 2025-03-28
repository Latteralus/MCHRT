// src/lib/dates/durationUtil.ts

/**
 * Calculates the duration between two dates in days (inclusive).
 * Basic implementation, assumes full days.
 * TODO: Enhance to exclude weekends or holidays if required.
 * TODO: Handle partial days or time components if balance is in hours.
 *
 * @param startDate The start date string (YYYY-MM-DD).
 * @param endDate The end date string (YYYY-MM-DD).
 * @returns The duration in days, or 0 if dates are invalid.
 */
export const calculateLeaveDuration = (startDate: string, endDate: string): number => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Add 1 day's worth of milliseconds to the end date to make it inclusive
    // and handle timezone shifts near midnight more robustly.
    const endInclusive = new Date(end.getTime() + 24 * 60 * 60 * 1000);

    // Basic validation
    if (isNaN(start.getTime()) || isNaN(endInclusive.getTime()) || endInclusive < start) {
      return 0;
    }

    // Calculate the difference in time (milliseconds)
    const differenceInTime = endInclusive.getTime() - start.getTime();

    // Calculate the difference in days
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);

    // Round up slightly to handle potential floating point inaccuracies near whole days
    // and then floor to get whole days. Or use Math.ceil if partial days count as full.
    // Let's use Math.round for simplicity now, assuming standard work days.
    const duration = Math.round(differenceInDays);

    // Ensure duration is at least 1 if start and end are the same valid day
    return Math.max(1, duration);

  } catch (error) {
    console.error("Error calculating leave duration:", error);
    return 0; // Return 0 on error
  }
};