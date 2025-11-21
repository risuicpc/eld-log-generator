import { Link } from "react-router";
import type {
  ComplianceStatus,
  DailyLog,
  RouteStats,
  TripData,
} from "~/types/trip";

export const OverviewTab = ({
  tripData,
  routeStats,
  params,
}: {
  tripData: TripData;
  routeStats: RouteStats;
  params: any;
}) => (
  <div className="overview-content">
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">📅</div>
        <div className="stat-content">
          <span className="stat-value">{routeStats.totalDays}</span>
          <span className="stat-label">Total Days</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">🚛</div>
        <div className="stat-content">
          <span className="stat-value">{routeStats.totalDrivingHours}h</span>
          <span className="stat-label">Total Driving</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">💼</div>
        <div className="stat-content">
          <span className="stat-value">
            {tripData.daily_logs
              ?.reduce(
                (sum: number, log: DailyLog) => sum + log.total_on_duty_hours,
                0
              )
              .toFixed(1)}
            h
          </span>
          <span className="stat-label">Total On Duty</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">📏</div>
        <div className="stat-content">
          <span className="stat-value">{routeStats.totalMiles}</span>
          <span className="stat-label">Total Miles</span>
        </div>
      </div>
    </div>

    <div className="recent-logs">
      <h4>📋 Recent Logs</h4>
      <div className="logs-preview">
        {tripData.daily_logs?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h4>No Logs Available</h4>
            <p>No daily logs have been created for this trip yet.</p>
          </div>
        ) : (
          <>
            {tripData.daily_logs
              ?.slice(0, 3)
              .map((log: DailyLog, index: number) => (
                <div key={log.id} className="log-preview-item">
                  <div className="log-preview-header">
                    <span className="log-date">
                      {new Date(log.log_date).toLocaleDateString()}
                    </span>
                    <span className="log-day">Day {log.day_number}</span>
                  </div>
                  <div className="log-preview-stats">
                    <span>🚛 {log.total_driving_hours.toFixed(1)}h</span>
                    <span>💼 {log.total_on_duty_hours.toFixed(1)}h</span>
                    <span>📏 {log.total_miles} mi</span>
                  </div>
                </div>
              ))}
            {tripData.daily_logs && tripData.daily_logs.length > 3 && (
              <div className="view-all-logs">
                <Link
                  to={`/trips/${params.id}/logs`}
                  className="btn btn-outline btn-sm"
                >
                  View All {tripData.daily_logs.length} Logs →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  </div>
);

export const RouteTab = ({
  trip,
  routeStats,
}: {
  trip: any;
  routeStats: RouteStats;
}) => (
  <div className="route-content">
    <div className="route-details-card">
      <h4>🗺️ Route Information</h4>
      <div className="route-info-grid">
        <div className="route-info-item">
          <strong>Start Point:</strong>
          <span>{trip.current_location}</span>
        </div>
        <div className="route-info-item">
          <strong>End Point:</strong>
          <span>{trip.dropoff_location}</span>
        </div>
        <div className="route-info-item">
          <strong>Pickup Location:</strong>
          <span>{trip.pickup_location}</span>
        </div>
        <div className="route-info-item">
          <strong>Total Distance:</strong>
          <span>{routeStats.totalMiles} miles</span>
        </div>
        <div className="route-info-item">
          <strong>Total Driving Time:</strong>
          <span>{routeStats.totalDrivingHours} hours</span>
        </div>
        <div className="route-info-item">
          <strong>Average Speed:</strong>
          <span>{routeStats.averageSpeed} mph</span>
        </div>
        <div className="route-info-item">
          <strong>Fuel Stops:</strong>
          <span>{routeStats.fuelStops} planned</span>
        </div>
        <div className="route-info-item">
          <strong>Estimated Duration:</strong>
          <span>{trip.estimated_duration} hours</span>
        </div>
      </div>
    </div>
  </div>
);

export const ComplianceTab = ({
  compliance,
}: {
  compliance: ComplianceStatus;
}) => (
  <div className="compliance-content">
    <div className="compliance-summary">
      <h4>✅ Compliance Summary</h4>
      <div className="compliance-stats">
        <div
          className={`compliance-stat ${compliance.seventyHourCycle.status}`}
        >
          <span className="stat-label">70-Hour Cycle</span>
          <span className="stat-value">
            {compliance.seventyHourCycle.message}
          </span>
        </div>
        <div className={`compliance-stat ${compliance.dailyDriving.status}`}>
          <span className="stat-label">Daily Driving</span>
          <span className="stat-value">{compliance.dailyDriving.message}</span>
        </div>
        <div
          className={`compliance-stat ${compliance.thirtyMinuteBreaks.status}`}
        >
          <span className="stat-label">30-Minute Breaks</span>
          <span className="stat-value">
            {compliance.thirtyMinuteBreaks.message}
          </span>
        </div>
        <div className={`compliance-stat ${compliance.restPeriods.status}`}>
          <span className="stat-label">Rest Periods</span>
          <span className="stat-value">{compliance.restPeriods.message}</span>
        </div>
      </div>
    </div>

    <div className="compliance-details">
      <h5>Compliance Rules</h5>
      <ul className="compliance-rules">
        <li>✅ 70-Hour Cycle: Maximum 70 hours in 8 consecutive days</li>
        <li>
          ✅ Daily Driving: Maximum 11 hours driving following 10 hours off duty
        </li>
        <li>✅ 30-Minute Break: Required after 8 hours of driving</li>
        <li>✅ Rest Periods: Minimum 10 hours off duty between shifts</li>
      </ul>
    </div>
  </div>
);
