import React from "react";
import { getHourRange } from "../utils/timeUtils";

interface LogGridProps {
  activities: any[];
}

const LogGrid: React.FC<LogGridProps> = ({ activities }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getActivityForHour = (hour: number) => {
    for (const activity of activities) {
      const activityHours = getHourRange(
        activity.start_time,
        activity.end_time
      );
      if (activityHours.includes(hour)) {
        return activity;
      }
    }
    return null;
  };

  const getStatusClass = (status: string) => {
    const classMap: Record<string, string> = {
      off_duty: "off-duty",
      sleeper_berth: "sleeper-berth",
      driving: "driving",
      on_duty: "on-duty",
    };
    return classMap[status] || "";
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return "12a";
    if (hour === 12) return "12p";
    if (hour > 12) return `${hour - 12}p`;
    return `${hour}a`;
  };

  return (
    <div className="log-grid">
      <div className="grid-header">
        <div className="status-label"></div>
        {hours.map((hour) => (
          <div key={hour} className="hour-header">
            {formatHour(hour)}
          </div>
        ))}
      </div>

      {["Off Duty", "Sleeper Berth", "Driving", "On Duty (Not Driving)"].map(
        (statusLabel, rowIndex) => {
          const statusMap: Record<string, string> = {
            "Off Duty": "off_duty",
            "Sleeper Berth": "sleeper_berth",
            Driving: "driving",
            "On Duty (Not Driving)": "on_duty",
          };

          const statusKey = statusMap[statusLabel];

          return (
            <div key={statusLabel} className="grid-row">
              <div className="status-label">{statusLabel}</div>
              {hours.map((hour) => {
                const activity = getActivityForHour(hour);
                const isActive = activity && activity.status === statusKey;

                return (
                  <div
                    key={hour}
                    className={`grid-cell ${isActive ? getStatusClass(statusKey) : ""} ${
                      isActive ? "active" : ""
                    }`}
                    title={
                      isActive
                        ? `${activity.description} (${activity.location})`
                        : ""
                    }
                  >
                    {isActive && "▮"}
                  </div>
                );
              })}
            </div>
          );
        }
      )}
    </div>
  );
};

export default LogGrid;
