import React from "react";
import { HOS_RULES } from "../utils/hosCalculations";
import { formatDurationHours } from "../utils/timeUtils";

interface HosComplianceProps {
  compliance: any;
  dailySchedules: any[];
}

const HosCompliance: React.FC<HosComplianceProps> = ({
  compliance,
  dailySchedules,
}) => {
  const cycleUsedEnd = compliance.cycle_used_end;
  const cycleRemaining = HOS_RULES.CYCLE_LIMIT_8_DAY - cycleUsedEnd;
  const cyclePercentage = (cycleUsedEnd / HOS_RULES.CYCLE_LIMIT_8_DAY) * 100;

  const getCycleColor = (percentage: number) => {
    if (percentage < 60) return "#10b981";
    if (percentage < 85) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="hos-compliance">
      <div className="compliance-header">
        <h3>✅ Hours of Service Compliance</h3>
        <p>FMCSA 49 CFR Part 395 - Property Carrying Vehicles</p>
      </div>

      <div className="compliance-overview">
        <div className="overview-card">
          <h4>⏰ 70-Hour/8-Day Cycle</h4>
          <div className="cycle-meter">
            <div className="meter-labels">
              <span>0h</span>
              <span>{HOS_RULES.CYCLE_LIMIT_8_DAY}h</span>
            </div>
            <div className="meter-bar">
              <div
                className="meter-fill"
                style={{
                  width: `${Math.min(cyclePercentage, 100)}%`,
                  backgroundColor: getCycleColor(cyclePercentage),
                }}
              ></div>
            </div>
            <div className="meter-value">
              <strong>{cycleUsedEnd.toFixed(1)}h</strong> used
              <span className="meter-remaining">
                ({cycleRemaining.toFixed(1)}h remaining)
              </span>
            </div>
          </div>
        </div>

        <div className="limits-grid">
          <div className="limit-card">
            <h5>🚛 Daily Driving</h5>
            <div className="limit-value">{HOS_RULES.DAILY_DRIVING_LIMIT}h</div>
            <p>Maximum driving time in a day</p>
          </div>
          <div className="limit-card">
            <h5>💼 Duty Window</h5>
            <div className="limit-value">{HOS_RULES.DUTY_WINDOW_LIMIT}h</div>
            <p>Maximum on-duty time in a day</p>
          </div>
          <div className="limit-card">
            <h5>☕ 30-Min Break</h5>
            <div className="limit-value">
              After {HOS_RULES.BREAK_REQUIRED_AFTER}h
            </div>
            <p>Required break from driving</p>
          </div>
          <div className="limit-card">
            <h5>😴 Off-Duty</h5>
            <div className="limit-value">{HOS_RULES.MIN_OFF_DUTY}h</div>
            <p>Minimum consecutive rest</p>
          </div>
        </div>
      </div>

      <div className="daily-breakdown">
        <h4>📅 Daily Schedule Compliance</h4>
        <div className="daily-list">
          {dailySchedules.map((day, index) => (
            <div
              key={index}
              className={`daily-card ${day.is_restart_day ? "restart-day" : ""}`}
            >
              <div className="daily-header">
                <span className="day-title">
                  Day {day.day_number} - {day.date}
                </span>
                {day.is_restart_day ? (
                  <span className="status-badge restart">
                    🔄 34-Hour Restart
                  </span>
                ) : day.hos_compliant ? (
                  <span className="status-badge compliant">✅ Compliant</span>
                ) : (
                  <span className="status-badge non-compliant">
                    ⚠️ Review Required
                  </span>
                )}
              </div>

              {!day.is_restart_day && (
                <div className="daily-stats">
                  <div className="stat-row">
                    <span className="stat-label">🚛 Driving Time:</span>
                    <span className="stat-value">
                      {day.total_driving_hours.toFixed(1)}h
                    </span>
                    <span
                      className={`stat-compliance ${day.total_driving_hours <= HOS_RULES.DAILY_DRIVING_LIMIT ? "good" : "bad"}`}
                    >
                      {day.total_driving_hours <= HOS_RULES.DAILY_DRIVING_LIMIT
                        ? "✅"
                        : "❌"}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">💼 On-Duty Time:</span>
                    <span className="stat-value">
                      {day.total_on_duty_hours.toFixed(1)}h
                    </span>
                    <span
                      className={`stat-compliance ${day.total_on_duty_hours <= HOS_RULES.DUTY_WINDOW_LIMIT ? "good" : "bad"}`}
                    >
                      {day.total_on_duty_hours <= HOS_RULES.DUTY_WINDOW_LIMIT
                        ? "✅"
                        : "❌"}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">☕ Breaks Taken:</span>
                    <span className="stat-value">{day.breaks_needed}</span>
                    <span className="stat-compliance good">✅</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">😴 Off-Duty Period:</span>
                    <span className="stat-value">
                      {day.total_off_duty_hours.toFixed(1)}h
                    </span>
                    <span
                      className={`stat-compliance ${day.total_off_duty_hours >= HOS_RULES.MIN_OFF_DUTY ? "good" : "bad"}`}
                    >
                      {day.total_off_duty_hours >= HOS_RULES.MIN_OFF_DUTY
                        ? "✅"
                        : "❌"}
                    </span>
                  </div>
                </div>
              )}

              {day.is_restart_day && (
                <div className="restart-details">
                  <p>
                    34 consecutive hours off duty to reset the 70-hour cycle.
                  </p>
                  <p>Cycle will be reset to 0 hours after completion.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="compliance-notes">
        <h4>📝 Important Notes</h4>
        <ul>
          <li>
            All times are calculated based on FMCSA Hours of Service regulations
          </li>
          <li>
            30-minute breaks are automatically scheduled after 8 hours of
            driving
          </li>
          <li>
            34-hour restart is included when the 70-hour cycle limit is reached
          </li>
          <li>Fuel stops are planned every 500 miles</li>
          <li>1 hour is allocated for both pickup and dropoff operations</li>
          <li>
            These are planned schedules - actual driving conditions may vary
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HosCompliance;
