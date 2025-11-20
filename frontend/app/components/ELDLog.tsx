import React from "react";
import { formatDate, calculateTotalHours } from "../utils/timeUtils";
import LogGrid from "./LogGrid";

interface ELDLogProps {
  dailyLog: any;
  logIndex: number;
  onPrint: () => void;
}

const ELDLog: React.FC<ELDLogProps> = ({ dailyLog, logIndex, onPrint }) => {
  const totalDriving = calculateTotalHours(dailyLog.activities, "driving");
  const totalOnDuty = calculateTotalHours(dailyLog.activities, "on_duty");
  const totalOffDuty = calculateTotalHours(dailyLog.activities, "off_duty");

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      off_duty: "#28a745",
      sleeper_berth: "#17a2b8",
      driving: "#dc3545",
      on_duty: "#ffc107",
    };
    return colors[status] || "#6c757d";
  };

  return (
    <div id={`eld-log-${logIndex}`} className="eld-log">
      <div className="log-header">
        <div className="log-title">
          <h3>DRIVER&apos;S DAILY LOG</h3>
          <span className="log-date">{formatDate(dailyLog.date)}</span>
        </div>
        <button onClick={onPrint} className="btn-print">
          Print Log
        </button>
      </div>

      <div className="log-info-grid">
        <div className="info-item">
          <label>Driver:</label>
          <span className="info-value">John Doe</span>
        </div>
        <div className="info-item">
          <label>Carrier:</label>
          <span className="info-value">ABC Trucking Company</span>
        </div>
        <div className="info-item">
          <label>Vehicle:</label>
          <span className="info-value">TRK-001</span>
        </div>
        <div className="info-item">
          <label>Total Miles:</label>
          <span className="info-value">
            {Math.round(dailyLog.estimated_distance)}
          </span>
        </div>
      </div>

      <div className="log-totals">
        <div className="total-item">
          <span className="total-label">Driving:</span>
          <span className="total-value">{totalDriving.toFixed(1)}h</span>
        </div>
        <div className="total-item">
          <span className="total-label">On Duty:</span>
          <span className="total-value">{totalOnDuty.toFixed(1)}h</span>
        </div>
        <div className="total-item">
          <span className="total-label">Off Duty:</span>
          <span className="total-value">{totalOffDuty.toFixed(1)}h</span>
        </div>
        <div className="total-item">
          <span className="total-label">Cycle Used:</span>
          <span className="total-value">
            {dailyLog.total_on_duty_hours.toFixed(1)}h
          </span>
        </div>
      </div>

      <LogGrid activities={dailyLog.activities} />

      <div className="log-remarks">
        <h4>REMARKS</h4>
        <div className="remarks-content">
          {dailyLog.activities.map((activity: any, index: number) => (
            <div key={index} className="remark-entry">
              <span className="remark-time">
                {new Date(activity.start_time).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
              <span className="remark-location">{activity.location}:</span>
              <span className="remark-description">{activity.description}</span>
              <span
                className="status-indicator"
                style={{ backgroundColor: getStatusColor(activity.status) }}
              ></span>
            </div>
          ))}
        </div>
      </div>

      <div className="log-certification">
        <p>I certify that these entries are true and correct:</p>
        <div className="signature-line">
          <span>Driver Signature: _________________________</span>
          <span>Date: {dailyLog.date}</span>
        </div>
      </div>

      {dailyLog.is_restart_day && (
        <div className="restart-notice">
          <strong>34-HOUR RESTART DAY:</strong> No driving permitted. 34
          consecutive hours off duty required to reset 70-hour cycle.
        </div>
      )}

      {!dailyLog.hos_compliant && (
        <div className="compliance-warning">
          <strong>HOS COMPLIANCE WARNING:</strong> This schedule may violate
          Hours of Service regulations.
        </div>
      )}
    </div>
  );
};

export default ELDLog;
