import React from "react";
import { getHourRange } from "../utils/timeUtils";

interface LogGridProps {
  activities: any[];
}

const LogGrid: React.FC<LogGridProps> = ({ activities }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getActivityForHour = (hour: number) => {
    for (const activity of activities) {
      const range = getHourRange(activity.start_time, activity.end_time);
      if (range.includes(hour)) return activity;
    }
    return null;
  };

  const statusMap: Record<string, number> = {
    off_duty: 0,
    sleeper_berth: 1,
    driving: 2,
    on_duty: 3,
  };

  const rows = ["Off Duty", "Sleeper Berth", "Driving", "On Duty"];

  return (
    <div className="eld-graph-wrapper">
      <div className="eld-graph-grid">
        {/* Header */}
        <div className="grid-header-row">
          <div className="grid-header-left">STATUS</div>
          {hours.map((h) => (
            <div key={h} className="grid-hour-cell">
              {h}
            </div>
          ))}
        </div>

        {/* 4 HOS rows */}
        {rows.map((rowLabel, rowIndex) => {
          return (
            <div key={rowLabel} className="grid-data-row">
              <div className="grid-status-label">{rowLabel}</div>

              {hours.map((hour) => {
                const activity = getActivityForHour(hour);
                const isActive =
                  activity && statusMap[activity.status] === rowIndex;

                return (
                  <div
                    key={hour}
                    className={`grid-hour-block ${
                      isActive ? "grid-active-block" : ""
                    }`}
                  >
                    {isActive && <div className="graph-line"></div>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LogGrid;
