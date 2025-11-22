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
      off_duty: "grid-cell-off-duty",
      sleeper_berth: "grid-cell-sleeper-berth",
      driving: "grid-cell-driving",
      on_duty: "grid-cell-on-duty",
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
    <div className="log-grid-container">
      <div className="log-grid">
        <div className="grid-header">
          <div className="status-label-header">STATUS</div>
          {hours.map((hour) => (
            <div key={hour} className="hour-header">
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {["Off Duty", "Sleeper Berth", "Driving", "On Duty"].map(
          (statusLabel, rowIndex) => {
            const statusMap: Record<string, string> = {
              "Off Duty": "off_duty",
              "Sleeper Berth": "sleeper_berth",
              Driving: "driving",
              "On Duty": "on_duty",
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
                        isActive ? "grid-cell-active" : "grid-cell-inactive"
                      }`}
                      title={
                        isActive
                          ? `${activity.description} (${activity.location})`
                          : ""
                      }
                    >
                      {isActive && <div className="grid-cell-indicator"></div>}
                    </div>
                  );
                })}
              </div>
            );
          }
        )}
      </div>

      {/* HOS Limits Legend */}
      <div className="grid-legend">
        <div className="legend-title">HOS STATUS LEGEND</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color legend-driving"></div>
            <span className="legend-label">Driving (Max 11 hrs)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-on-duty"></div>
            <span className="legend-label">On Duty (Max 14 hrs)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-off-duty"></div>
            <span className="legend-label">Off Duty</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-sleeper"></div>
            <span className="legend-label">Sleeper Berth</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogGrid;
