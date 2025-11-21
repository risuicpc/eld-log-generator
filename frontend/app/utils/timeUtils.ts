export const formatTime = (dateTimeString: string): string => {
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDurationHours = (hours: number): string => {
  const totalMinutes = Math.round(hours * 60);
  const hoursPart = Math.floor(totalMinutes / 60);
  const minutesPart = totalMinutes % 60;

  if (hoursPart === 0) {
    return `${minutesPart}m`;
  } else if (minutesPart === 0) {
    return `${hoursPart}h`;
  } else {
    return `${hoursPart}h ${minutesPart}m`;
  }
};

export const getHourRange = (startTime: string, endTime: string): number[] => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const hours: number[] = [];

  let current = new Date(start);
  current.setMinutes(0, 0, 0);

  while (current <= end) {
    hours.push(current.getHours());
    current.setHours(current.getHours() + 1);
  }

  return hours;
};

export const calculateTotalHours = (
  activities: any[],
  status: string
): number => {
  return activities
    .filter((activity) => activity.status === status)
    .reduce(
      (total: number, activity: any) => total + activity.duration_hours,
      0
    );
};

export const formatDuration = (hours: number): string => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}h ${minutes}m`;
};

export const getStatusBadgeClass = (status: "compliant" | "violation") => {
  return status === "compliant"
    ? "status-badge compliant"
    : "status-badge violation";
};
