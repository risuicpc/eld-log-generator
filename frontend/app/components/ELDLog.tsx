import React from "react";
import LogGrid from "./LogGrid";
import { formatDate, calculateTotalHours } from "../utils/timeUtils";

interface ELDLogProps {
  dailyLog: any;
  logIndex: number;
  onPrint: () => void;
}

const ELDLog: React.FC<ELDLogProps> = ({ dailyLog, logIndex, onPrint }) => {
  const totalDriving = calculateTotalHours(dailyLog.activities, "driving");
  const totalOnDuty = calculateTotalHours(dailyLog.activities, "on_duty");
  const totalOffDuty = calculateTotalHours(dailyLog.activities, "off_duty");

  return (
    <div id={`eld-log-${logIndex}`} className="eld-log-wrapper">
      {/* Top Header */}
      <div className="eld-header">
        <div className="header-left">
          <div className="dot-title">U.S. DEPARTMENT OF TRANSPORTATION</div>
          <h2 className="main-title">DRIVER'S DAILY LOG</h2>
        </div>

        <div className="header-right">
          <button onClick={onPrint} className="print-btn">
            Print
          </button>
        </div>
      </div>

      {/* Sub Header */}
      <div className="sub-header-grid">
        <div className="sub-item">
          <label>MONTH</label>
          <span>{new Date(dailyLog.date).getMonth() + 1}</span>
        </div>
        <div className="sub-item">
          <label>DAY</label>
          <span>{new Date(dailyLog.date).getDate()}</span>
        </div>
        <div className="sub-item">
          <label>YEAR</label>
          <span>{new Date(dailyLog.date).getFullYear()}</span>
        </div>
        <div className="sub-item">
          <label>TRUCK / TRACTOR</label>
          <span>350</span>
        </div>
        <div className="sub-item">
          <label>MILES TODAY</label>
          <span>{Math.round(dailyLog.estimated_distance)}</span>
        </div>
      </div>

      {/* Carrier + Driver */}
      <div className="carrier-driver-row">
        <div className="carrier-block">
          <label>NAME OF CARRIER / CONTRACTOR</label>
          <div className="carrier-name">John Doe's Transportation</div>
          <div className="carrier-city">Washington, D.C.</div>
        </div>

        <div className="driver-block">
          <label>DRIVER'S NAME</label>
          <div className="driver-name">John E. Doe</div>
        </div>
      </div>

      {/* GRID SECTION */}
      <LogGrid activities={dailyLog.activities} />

      {/* Totals Section */}
      <div className="totals-grid">
        <div className="total-col">
          <label>OFF DUTY</label>
          <span>{totalOffDuty.toFixed(2)}</span>
        </div>
        <div className="total-col">
          <label>SLEEPER</label>
          <span>0.00</span>
        </div>
        <div className="total-col">
          <label>DRIVING</label>
          <span>{totalDriving.toFixed(2)}</span>
        </div>
        <div className="total-col">
          <label>ON DUTY</label>
          <span>{totalOnDuty.toFixed(2)}</span>
        </div>
        <div className="total-col total-hours">
          <label>TOTAL HOURS</label>
          <span>24</span>
        </div>
      </div>

      {/* Remarks */}
      <div className="remarks-section">
        <h4>REMARKS</h4>
        <div className="remarks-grid">
          {dailyLog.activities.map((a: any, i: number) => (
            <div key={i} className="remark-row">
              <div className="remark-time">
                {new Date(a.start_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </div>
              <div className="remark-text">{a.location}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Certification */}
      <div className="cert-section">
        <p>I certify that these entries are true and correct:</p>
        <div className="cert-line">
          Driver Signature: _________________________
        </div>
        <div className="cert-line">Date: {formatDate(dailyLog.date)}</div>
      </div>
    </div>
  );
};

export default ELDLog;
