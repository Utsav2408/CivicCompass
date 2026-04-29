import { useEffect, useState } from "react";

import { getDaysHoursMinutes } from "@shared/utils/formatDate";

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  isUrgent: boolean;
}

/**
 * useCountdownTick — hook to manage countdown state.
 * Updates every 60 seconds and cleans up on unmount.
 * @param targetDate — The date to count down to
 */
export function useCountdownTick(targetDate: string | Date | undefined) {
  const [state, setState] = useState<CountdownState | null>(null);

  useEffect(() => {
    if (!targetDate) return;

    const target = new Date(targetDate);

    const update = () => {
      setState(getDaysHoursMinutes(target));
    };

    update();
    const interval = setInterval(update, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [targetDate]);

  return state;
}
