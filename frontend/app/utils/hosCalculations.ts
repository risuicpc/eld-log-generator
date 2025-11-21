import type { ComplianceStatus, DailyLog, RouteStats } from "~/types/trip";

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

export const calculateCompliance = (logs: DailyLog[]): ComplianceStatus => {
  const totalCycleUsed = logs.reduce((sum, log) => sum + log.cycle_used, 0);
  const has30MinBreaks = logs.every((log) =>
    log.activities.some(
      (activity) =>
        activity.status === "off_duty" && activity.duration_hours >= 0.5
    )
  );

  const hasAdequateRest = logs.every((log) =>
    log.activities.some(
      (activity) =>
        activity.status === "off_duty" && activity.duration_hours >= 10
    )
  );

  return {
    seventyHourCycle: {
      status: totalCycleUsed <= 70 ? "compliant" : "violation",
      message:
        totalCycleUsed <= 70
          ? "Within Limits"
          : `Exceeded by ${(totalCycleUsed - 70).toFixed(1)} hours`,
    },
    dailyDriving: {
      status: logs.every((log) => log.total_driving_hours <= 11)
        ? "compliant"
        : "violation",
      message: logs.every((log) => log.total_driving_hours <= 11)
        ? "Compliant"
        : "Daily limit exceeded",
    },
    thirtyMinuteBreaks: {
      status: has30MinBreaks ? "compliant" : "violation",
      message: has30MinBreaks ? "Included" : "Missing breaks",
    },
    restPeriods: {
      status: hasAdequateRest ? "compliant" : "violation",
      message: hasAdequateRest ? "Adequate" : "Insufficient rest",
    },
  };
};

export const calculateRouteStats = (
  logs: DailyLog[],
  trip: any
): RouteStats => {
  const totalMiles = logs.reduce((sum, log) => sum + log.total_miles, 0);
  const totalDrivingHours = logs.reduce(
    (sum, log) => sum + log.total_driving_hours,
    0
  );
  const averageSpeed =
    totalDrivingHours > 0 ? totalMiles / totalDrivingHours : 0;

  return {
    totalMiles,
    totalDrivingHours: totalDrivingHours.toFixed(1),
    averageSpeed: averageSpeed.toFixed(1),
    fuelStops: Math.ceil(totalMiles / 500),
    totalDays: logs.length,
  };
};
