export const HOS_RULES = {
  DAILY_DRIVING_LIMIT: 11,
  DUTY_WINDOW_LIMIT: 14,
  CYCLE_LIMIT_8_DAY: 70,
  MIN_BREAK_DURATION: 0.5,
  BREAK_REQUIRED_AFTER: 8,
  MIN_OFF_DUTY: 10,
  RESTART_HOURS: 34,
};

export const calculateBreaksNeeded = (drivingHours: number): number => {
  if (drivingHours <= HOS_RULES.BREAK_REQUIRED_AFTER) {
    return 0;
  }
  return Math.floor(drivingHours / HOS_RULES.BREAK_REQUIRED_AFTER);
};

export const isDrivingAllowed = (
  currentCycleUsed: number,
  additionalHours: number = 0
): boolean => {
  return currentCycleUsed + additionalHours <= HOS_RULES.CYCLE_LIMIT_8_DAY;
};

export const calculateAvailableDrivingTime = (
  currentCycleUsed: number
): number => {
  return Math.max(0, HOS_RULES.CYCLE_LIMIT_8_DAY - currentCycleUsed);
};

export const needsRestart = (currentCycleUsed: number): boolean => {
  return currentCycleUsed >= HOS_RULES.CYCLE_LIMIT_8_DAY;
};

export const validateDailySchedule = (activities: any[]) => {
  let totalDriving = 0;
  let totalOnDuty = 0;
  const violations: string[] = [];

  activities.forEach((activity: any) => {
    if (activity.status === "driving") {
      totalDriving += activity.duration_hours;
    }
    if (activity.status === "driving" || activity.status === "on_duty") {
      totalOnDuty += activity.duration_hours;
    }
  });

  if (totalDriving > HOS_RULES.DAILY_DRIVING_LIMIT) {
    violations.push(
      `Daily driving limit exceeded: ${totalDriving.toFixed(1)}h > ${HOS_RULES.DAILY_DRIVING_LIMIT}h`
    );
  }

  if (totalOnDuty > HOS_RULES.DUTY_WINDOW_LIMIT) {
    violations.push(
      `Duty window exceeded: ${totalOnDuty.toFixed(1)}h > ${HOS_RULES.DUTY_WINDOW_LIMIT}h`
    );
  }

  return {
    isCompliant: violations.length === 0,
    violations,
    totals: {
      driving: totalDriving,
      onDuty: totalOnDuty,
    },
  };
};
