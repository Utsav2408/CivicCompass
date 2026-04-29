/**
 * getDaysHoursMinutes — calculates time remaining until a target date.
 * @param targetDate — The date to count down to
 * @returns Object with days, hours, minutes and isUrgent flag
 */
export function getDaysHoursMinutes(targetDate: Date) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, isUrgent: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  // Urgent if less than 24 hours remaining
  const isUrgent = diff < 1000 * 60 * 60 * 24;

  return { days, hours, minutes, isUrgent };
}
