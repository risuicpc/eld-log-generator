import type { Route } from "./+types/trips.$id.logs";
import { useLoaderData, Link, useParams } from "react-router";
import ELDLog from "../components/ELDLog";
import { getTripLogs } from "~/services/api";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Trip ${params.id} Logs - ELD Log Generator` }];
}

export async function clientLoader({ params }: { params: { id: string } }) {
  try {
    const tripData = await getTripLogs(params.id);
    return { tripData };
  } catch (error) {
    throw new Error(`Failed to load trip logs: ${params.id}`);
  }
}

clientLoader.hydrate = true;

export default function TripLogsPage() {
  const { tripData } = useLoaderData() as { tripData: any };
  const params = useParams();

  const handlePrintLog = (logIndex: number) => {
    const element = document.getElementById(`eld-log-${logIndex}`);
    if (element) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>ELD Log</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .eld-log { border: 2px solid #000; padding: 20px; }
                .log-header { text-align: center; margin-bottom: 20px; }
                .log-grid { margin: 20px 0; }
                .grid-row { display: flex; border-bottom: 1px solid #ccc; }
                .grid-cell { flex: 1; padding: 5px; text-align: center; border-right: 1px solid #ccc; }
                .grid-header { font-weight: bold; background: #f0f0f0; }
                .active { background: #000; color: white; }
              </style>
            </head>
            <body>
              ${element.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (!tripData) {
    return (
      <div className="trip-logs-page">
        <div className="error-message-container">
          <div className="error-icon">⚠️</div>
          <h3>Trip Not Found</h3>
          <p>The requested trip could not be found.</p>
          <Link to="/" className="btn btn-primary">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const logs = tripData.daily_logs || [];

  return (
    <div className="trip-logs-page">
      <div className="logs-header">
        <div>
          <h2>📋 Trip Logs</h2>
          <p className="text-gray-600">
            {tripData.trip?.current_location} →{" "}
            {tripData.trip?.dropoff_location}
          </p>
        </div>
        <div className="header-actions">
          <Link to={`/trips/${params.id}`} className="btn btn-secondary">
            ← Back to Trip
          </Link>
          <button className="btn btn-outline">🖨️ Print All</button>
        </div>
      </div>

      <div className="logs-summary">
        <div className="summary-card">
          <div className="summary-item">
            <span className="summary-label">Total Logs</span>
            <span className="summary-value">{logs.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Driving</span>
            <span className="summary-value">
              {logs
                .reduce(
                  (sum: number, log: any) => sum + log.total_driving_hours,
                  0
                )
                .toFixed(1)}
              h
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total On Duty</span>
            <span className="summary-value">
              {logs
                .reduce(
                  (sum: number, log: any) => sum + log.total_on_duty_hours,
                  0
                )
                .toFixed(1)}
              h
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Miles</span>
            <span className="summary-value">
              {logs.reduce((sum: number, log: any) => sum + log.total_miles, 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="logs-filter">
        <div className="filter-options">
          <button className="filter-btn active">All Logs</button>
          <button className="filter-btn">Driving Days</button>
          <button className="filter-btn">Rest Days</button>
        </div>
        <div className="sort-options">
          <select className="sort-select">
            <option>Sort by Date</option>
            <option>Sort by Day Number</option>
            <option>Sort by Driving Hours</option>
          </select>
        </div>
      </div>

      <div className="logs-container">
        {logs.length > 0 ? (
          logs.map((log: any, index: number) => (
            <div key={index} className="log-wrapper">
              <div className="log-header-info">
                <h3>
                  📅 Day {log.day_number} -{" "}
                  {new Date(log.log_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <div className="log-stats-badge">
                  <span>🚛 {log.total_driving_hours.toFixed(1)}h</span>
                  <span>💼 {log.total_on_duty_hours.toFixed(1)}h</span>
                  <span>📏 {log.total_miles} mi</span>
                </div>
              </div>
              <ELDLog
                dailyLog={{
                  ...log,
                  activities: log.duty_statuses || [],
                  estimated_distance: log.total_miles,
                  total_on_duty_hours: log.total_on_duty_hours,
                }}
                logIndex={index}
                onPrint={() => handlePrintLog(index)}
              />
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No Logs Available</h3>
            <p>There are no logs available for this trip.</p>
            <Link to="/trips/calculate" className="btn btn-primary">
              Create New Trip
            </Link>
          </div>
        )}
      </div>

      {logs.length > 0 && (
        <div className="logs-footer">
          <div className="footer-actions">
            <button className="btn btn-outline">📥 Export All Logs</button>
            <button className="btn btn-primary">🖨️ Print All Logs</button>
          </div>
          <div className="footer-info">
            <p>
              Showing {logs.length} log{logs.length !== 1 ? "s" : ""} •
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
